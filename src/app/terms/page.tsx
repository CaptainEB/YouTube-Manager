import type { Metadata } from "next";
import Link from "next/link";

import { LegalDocument } from "@/components/legal/legal-document";
import { termsOfServiceMarkdown } from "@/lib/legal";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-16">
      <Link href="/" className="text-muted-foreground hover:text-foreground mb-8 text-sm">
        &larr; Back home
      </Link>
      <LegalDocument markdown={termsOfServiceMarkdown} />
    </div>
  );
}
