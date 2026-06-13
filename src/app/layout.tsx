import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { TokenProvider } from "@/contexts/TokenContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { PricingModal } from "@/components/PricingModal";
import { OnboardingModal } from "@/components/OnboardingModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://checkit.ai'),
  title: "CheckIt - AI-аналіз бізнес-ідей",
  description: "AI-система для первинної оцінки бізнес-ідей та стартапів. Отримайте професійний аналіз за секунди.",
  openGraph: {
    title: "CheckIt - Перевір свою бізнес-ідею",
    description: "Миттєвий AI-аналіз стартапів: оцінка ризиків, конкурентів та потенціалу.",
    url: "https://checkit.ai",
    siteName: "CheckIt",
    images: [
      {
        url: "/logo.png", // In production you should use an absolute URL or a bigger og-image
        width: 800,
        height: 600,
      },
    ],
    locale: "uk_UA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CheckIt - AI-аналіз бізнес-ідей",
    description: "Перевір свою ідею для стартапу за допомогою штучного інтелекту.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${inter.variable} ${playfair.variable} antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground">
        <ErrorBoundary>
          <AuthProvider>
            <TokenProvider>
              <Header />
              <main>
                {children}
              </main>
              <Footer />
              <AuthModal />
              <PricingModal />
              <OnboardingModal />
            </TokenProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
