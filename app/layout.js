import "./globals.css";

export const metadata = {
  title: "ZIPHIX | Home services, made simple",
  description: "Book vetted local home service professionals at a fixed upfront price.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
