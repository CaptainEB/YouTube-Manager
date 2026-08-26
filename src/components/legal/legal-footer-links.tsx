import Link from "next/link";

export function LegalFooterLinks() {
  return (
    <p className="text-muted-foreground text-xs">
      <Link href="/terms" className="hover:text-foreground underline underline-offset-2">
        Terms of Service
      </Link>
      {" · "}
      <Link href="/privacy" className="hover:text-foreground underline underline-offset-2">
        Privacy Policy
      </Link>
    </p>
  );
}
