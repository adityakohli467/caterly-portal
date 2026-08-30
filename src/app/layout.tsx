import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Header } from "@/components/layout/header"
import { TopBar } from "@/components/layout/top-bar"
import { Footer } from "@/components/layout/footer"
import { SessionManager } from "@/components/session-manager"
import { Toaster } from "sonner"
import { RequestAQuoteModal } from "@/components/request-a-quote-modal"
import { AuthModal } from "@/components/auth/AuthModal"
import { AiChatWidget } from "@/components/chat/ai-chat-widget"

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
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-52WBCHDQ');`}
        </Script>
        {/* End Google Tag Manager */}
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-W87QGS9SQ1"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-W87QGS9SQ1');`}
        </Script>      </head>
      <body className={`${inter.className} bg-[#0a0a0a] text-white`} style={albertSans}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-52WBCHDQ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
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
          <AiChatWidget />
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


