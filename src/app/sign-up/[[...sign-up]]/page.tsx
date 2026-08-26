import { SignUp } from "@clerk/nextjs";

import { LegalFooterLinks } from "@/components/legal/legal-footer-links";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <SignUp />
      <LegalFooterLinks />
    </div>
  );
}
