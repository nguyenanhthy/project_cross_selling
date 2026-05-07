import "./globals.css";
import SidebarShop from "../components/SidebarShop";
import Providers from "./providers";

export const metadata = {
  title: "CrossSell AI",
  description: "Cross-Selling Recommendation Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#0a0f1e] text-[#f9fafb]">
        <Providers>
          <div className="flex min-h-screen">
            <SidebarShop />
            <main className="ml-0 flex-1 overflow-y-auto px-6 py-8 md:ml-[240px]">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
