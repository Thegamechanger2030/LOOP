import type { Metadata } from "next";
import "./globals.css";
import { AuthSessionProvider } from "@/components/session-provider";

export const metadata: Metadata = {
  title: "LOOP — Customer Feedback Intelligence",
  description: "AI-powered customer feedback intelligence platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
