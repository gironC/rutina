import "./globals.css";
import { Toaster } from "sonner";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-theme="cartas">
      <body className="bg-base-200">
        {children}
        <Toaster expand={true} position="top-center" />
      </body>
    </html>
  );
}
