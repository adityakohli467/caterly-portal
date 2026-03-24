import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Header } from "@/components/layout/header"
import { TopBar } from "@/components/layout/top-bar"
import { Footer } from "@/components/layout/footer"
import { SessionManager } from "@/components/session-manager"
import { Toaster } from "sonner"
import { RequestAQuoteModal } from "@/components/request-a-quote-modal"
import { AuthModal } from "@/components/auth/AuthModal"

const inter = Inter({ subsets: ["latin"] })

// Add Albert Sans font
const albertSans = {
  fontFamily: "'Albert Sans', sans-serif",
}

export const metadata: Metadata = {
  title: "Caterly",
  description: "Where quality is more than a promise. Experience the perfect harmony of flavor, creativity, and hospitality.",
  icons: {
    icon: "/assets/images/cat_logo.png",
    apple: "/assets/images/cat_logo.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0a0a] text-white`} style={albertSans}>
        <Providers>
          <SessionManager />
          <div className="flex flex-col min-h-screen bg-[#0a0a0a]">
            <TopBar />
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <RequestAQuoteModal />
          <AuthModal />
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={3000}
          />
        </Providers>
      </body>
    </html>
  )
}


