import type { ChatMessage } from "@/lib/prompt";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const TEXT_TIMEOUT_MS = 60_000;
// Image generation is slower than a text completion, so it gets a longer budget.
const IMAGE_TIMEOUT_MS = 90_000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_CONTENT_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

type JsonSchemaFormat = {
  name: string;
  schema: Record<string, unknown>;
};

type ChatCompletionResponse = {
  choices?: {
    message?: {
      content?: string;
      images?: { image_url?: { url?: string } }[];
    };
  }[];
};

// Shared POST to OpenRouter's OpenAI-compatible chat completions endpoint. Uses plain fetch rather
// than the openai SDK or axios: OpenRouter is a single REST endpoint, so a dependency buys nothing
// here and keeps the install footprint (and Bun's trusted-dependency list) smaller. Server-only —
// never import this from a "use client" file, since OPENROUTER_API_KEY must never reach the browser bundle.
async function postChatCompletion(
  body: Record<string, unknown>,
  timeoutMs: number,
): Promise<ChatCompletionResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set. See SETUP.md.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        // Sent only as a bearer token over HTTPS to OpenRouter itself — never logged, never echoed back to the client.
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("The model took too long to respond. Please try again.");
    }
    throw new Error("Could not reach OpenRouter. Check your connection and try again.");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => null);
    const message =
      (errorBody as { error?: { message?: string } } | null)?.error?.message ??
      `OpenRouter request failed (${response.status})`;
    throw new Error(message);
  }

  return response.json() as Promise<ChatCompletionResponse>;
}

// Returns the model's response parsed as JSON — response_format: json_schema forces the model into that shape.
export async function generateJsonCompletion({
  model,
  temperature,
  maxOutputTokens,
  messages,
  jsonSchema,
}: {
  model: string;
  temperature: number;
  maxOutputTokens: number;
  messages: ChatMessage[];
  jsonSchema: JsonSchemaFormat;
}): Promise<unknown> {
  const data = await postChatCompletion(
    {
      model,
      temperature,
      max_completion_tokens: maxOutputTokens,
      messages,
      response_format: {
        type: "json_schema",
        json_schema: { name: jsonSchema.name, strict: true, schema: jsonSchema.schema },
      },
    },
    TEXT_TIMEOUT_MS,
  );

  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("The model returned an empty response.");
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new Error("The model returned a response in an unexpected format.");
  }
}

// Calls an image-generation-capable OpenRouter model (e.g. a Nano Banana / GPT Image slug) and
// returns the decoded image bytes, ready to hand to an upload helper (e.g. src/lib/r2.ts).
export async function generateImage({
  model,
  prompt,
  aspectRatio,
}: {
  model: string;
  prompt: string;
  aspectRatio?: string;
}): Promise<{ data: Buffer; contentType: string }> {
  const data = await postChatCompletion(
    {
      model,
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
      ...(aspectRatio ? { image_config: { aspect_ratio: aspectRatio } } : {}),
    },
    IMAGE_TIMEOUT_MS,
  );

  const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (typeof imageUrl !== "string") {
    throw new Error("The model did not return an image.");
  }

  const image = await decodeImage(imageUrl);
  if (image.data.byteLength > MAX_IMAGE_BYTES) {
    throw new Error("The generated image is too large.");
  }
  if (!ALLOWED_IMAGE_CONTENT_TYPES.has(image.contentType)) {
    throw new Error("The model returned an unsupported image type.");
  }

  return image;
}

// OpenRouter's image output is usually a base64 data: URL, but the spec allows a plain https: URL
// too (some providers host the result instead of inlining it) — handle both.
async function decodeImage(url: string): Promise<{ data: Buffer; contentType: string }> {
  const dataUrlMatch = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(url);
  if (dataUrlMatch) {
    const contentType = dataUrlMatch[1];
    const base64Data = dataUrlMatch[2];
    if (!contentType || !base64Data) {
      throw new Error("The model returned an image in an unexpected format.");
    }
    return { data: Buffer.from(base64Data, "base64"), contentType };
  }

  if (!url.startsWith("https://")) {
    throw new Error("The model returned an image in an unexpected format.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!response.ok) {
      throw new Error("Could not download the generated image.");
    }
    const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
    return { data: Buffer.from(await response.arrayBuffer()), contentType };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Downloading the generated image took too long. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
