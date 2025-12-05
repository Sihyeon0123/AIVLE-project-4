import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "./components/Footer"
import Navbar from "./components/Navbar"

export default function RootLayout({ children }) {
  return (
    <html lang="kr">
      <body>
        <Navbar/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}
