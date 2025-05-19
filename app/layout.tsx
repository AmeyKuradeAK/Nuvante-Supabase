import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import connect from "@/db";
import { ClerkProvider } from "@clerk/nextjs";
import { GlobalContextProvider } from "@/context/Global";

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
  title: "Nuvante | E-Commerce",
  description: "Nuvante Fashion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider dynamic>
      <GlobalContextProvider>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            {children}
          </body>
        </html>
      </GlobalContextProvider>
    </ClerkProvider>
  );
}
