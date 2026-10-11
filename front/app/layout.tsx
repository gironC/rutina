import "./globals.css";
import { Toaster } from "sonner";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-theme="cartas">
      <body>
        {children}
        <Toaster expand={true} position="top-center" />
      </body>
    </html>
  );
}
