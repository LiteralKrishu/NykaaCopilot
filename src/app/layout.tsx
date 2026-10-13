import type { Metadata } from "next";
import "./globals.css";
import "./original-home.css";
import "./tryon.css";

export const metadata: Metadata = {
  title: "Nykaa Look Copilot | Full Makeup Studio",
  description: "Explore makeup colors, match products, and try a complete look on your face.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
