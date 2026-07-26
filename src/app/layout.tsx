import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { SteamProvider } from "@/context/SteamContext";
import { SearchProvider } from "@/context/SearchContext";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { SignInPrompt } from "@/components/ui/sign-in-prompt";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gamerbhidu.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Gamer Bhidu | Premium PC Games at Unbeatable Prices",
    template: "%s | Gamer Bhidu",
  },
  description:
    "Your ultimate destination for discounted PC games. Browse thousands of titles, grab unbeatable deals, and build your library for less.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Gamer Bhidu",
    title: "Gamer Bhidu | Premium PC Games at Unbeatable Prices",
    description:
      "Your ultimate destination for discounted PC games. Browse thousands of titles, grab unbeatable deals, and build your library for less.",
    images: [
      {
        url: `${SITE_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: "Gamer Bhidu – PC Gaming Deals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gamer Bhidu | Premium PC Games at Unbeatable Prices",
    description:
      "Your ultimate destination for discounted PC games. Browse thousands of titles, grab unbeatable deals, and build your library for less.",
    images: [`${SITE_URL}/api/og`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <SteamProvider>
                <SearchProvider>
                  {children}
                  <Analytics />
                  <Toaster
                    position="bottom-center"
                    toastOptions={{
                      style: {
                        background: "#111111",
                        border: "1px solid #262626",
                        color: "#fff",
                      },
                    }}
                  />
                  <SignInPrompt />
                </SearchProvider>
              </SteamProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

