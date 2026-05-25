import "../app/globals.css";
import AppProviders from "@/components/providers/AppProviders";

export const metadata = {
  title: "My Baseball Record",
  description: "개인 선수용 모바일 웹 기록 관리 서비스",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
