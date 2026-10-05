import "../../styles/globals.css";
import MainProviders from "./_components/main-providers";
import BreadcrumbTrail from "./_components/navigation/breadcrumb-trail";
import Navbar from "./_components/navigation/navbar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MainProviders>
      <a className="skip-link" href="#main-content">
        Bỏ qua điều hướng, đến nội dung chính
      </a>
      <Navbar />
      <BreadcrumbTrail />
      <main
        id="main-content"
        className="min-h-screen scroll-mt-[calc(var(--app-header-height)+3.5rem)]"
        tabIndex={-1}
      >
        {children}
      </main>
    </MainProviders>
  );
}
