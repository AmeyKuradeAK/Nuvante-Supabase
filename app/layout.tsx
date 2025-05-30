import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import connect from "@/db";
import { ClerkProvider } from "@clerk/nextjs";
import { GlobalContextProvider } from "@/context/Global";
import { AlertProvider } from "@/context/AlertContext";
import CacheBuster from "@/components/CacheBuster";

//? an inline function to connect to mongodb atlas using mongoose.
(async () => {
  await connect();
})();

//TODO: c̶r̶e̶a̶t̶e̶ a̶ m̶o̶n̶g̶o̶o̶s̶e̶ m̶o̶d̶e̶l̶,̶ a̶d̶d̶ a̶ d̶u̶m̶m̶y̶ p̶r̶o̶d̶u̶c̶t̶ t̶o̶ t̶h̶e̶ d̶a̶t̶a̶b̶a̶s̶e̶.̶
//TODO: G̶o̶ f̶o̶r̶ t̶h̶e̶ p̶r̶o̶d̶u̶c̶t̶ m̶o̶d̶e̶l̶ f̶i̶r̶s̶t̶
//TODO: S̶u̶c̶c̶e̶s̶s̶f̶u̶l̶l̶y̶ m̶a̶k̶e̶ t̶h̶e̶ u̶s̶e̶r̶s̶ m̶o̶d̶e̶l̶ f̶u̶n̶c̶t̶i̶o̶n̶a̶l̶.̶
// (async () => {
//   const newProduct = new productModel({
//     productName: "Kaze Ga Fuku",
//     productImages: [
//       "http://localhost:3000/product.png",
//       "http://localhost:3000/product.png",
//       "http://localhost:3000/product.png",
//       "http://localhost:3000/product.png",
//       "http://localhost:3000/Big-Product.png",
//     ],
//     productPrice: "999",
//     cancelledProductPrice: "1500",
//     productStars: 4,
//     productReviews: [
//       "shit product, too big for me, and for my uncle khali.",
//       "never have i ever wore a tshirt like this.",
//     ],
//     latest: true,
//   });
//   await newProduct.save();
// })();

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Nuvante | Premium Fashion & Lifestyle",
  description: "Discover premium fashion and lifestyle products at Nuvante. Shop the latest trends in clothing, accessories, and more.",
  keywords: "fashion, lifestyle, clothing, accessories, premium, trendy",
  authors: [{ name: "Nuvante Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Nuvante | Premium Fashion & Lifestyle",
    description: "Discover premium fashion and lifestyle products at Nuvante. Shop the latest trends in clothing, accessories, and more.",
    type: "website",
    locale: "en_US",
  },
  // Cache busting metadata
  other: {
    "cache-control": "no-cache, no-store, must-revalidate",
    "pragma": "no-cache",
    "expires": "0",
    "app-version": Date.now().toString(),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appVersion = "2024122901"; // Update this when deploying fixes
  
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* Razorpay Script */}
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
          
          {/* Cache busting meta tags */}
          <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
          <meta httpEquiv="Pragma" content="no-cache" />
          <meta httpEquiv="Expires" content="0" />
          <meta name="app-version" content={appVersion} />
          
          {/* PWA Cache Busting */}
          <meta name="theme-color" content="#DB4444" />
          <meta name="msapplication-navbutton-color" content="#DB4444" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          
          {/* Force refresh script */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Force cache clear and reload if version changed
                (function() {
                  const currentVersion = '${appVersion}';
                  const storedVersion = localStorage.getItem('nuvante-app-version');
                  
                  if (storedVersion && storedVersion !== currentVersion) {
                    console.log('New app version detected, clearing cache...');
                    
                    // Clear all browser caches
                    if ('caches' in window) {
                      caches.keys().then(function(names) {
                        names.forEach(function(name) {
                          caches.delete(name);
                        });
                      });
                    }
                    
                    // Clear service worker cache
                    if ('serviceWorker' in navigator) {
                      navigator.serviceWorker.getRegistrations().then(function(registrations) {
                        registrations.forEach(function(registration) {
                          registration.update();
                        });
                      });
                    }
                    
                    // Clear localStorage (except essential items)
                    const essentialKeys = ['clerk-session', 'clerk-db-jwt'];
                    const keys = Object.keys(localStorage);
                    keys.forEach(function(key) {
                      if (!essentialKeys.some(function(essential) { return key.includes(essential); })) {
                        localStorage.removeItem(key);
                      }
                    });
                    
                    // Clear sessionStorage
                    sessionStorage.clear();
                    
                    // Set new version
                    localStorage.setItem('nuvante-app-version', currentVersion);
                    
                    // Force hard reload with cache bypass
                    window.location.reload(true);
                    return;
                  }
                  
                  if (!storedVersion) {
                    localStorage.setItem('nuvante-app-version', currentVersion);
                  }
                })();
              `,
            }}
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <GlobalContextProvider>
            <AlertProvider>
              {children}
              <CacheBuster />
            </AlertProvider>
          </GlobalContextProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
