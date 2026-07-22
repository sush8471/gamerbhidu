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

export const metadata: Metadata = {
  title: "Gamer Bhidu | Premium PC Games at Unbeatable Prices",
  description: "Your ultimate destination for PC gaming deals",
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

