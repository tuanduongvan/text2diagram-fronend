import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';

export const AppLayout = () => {
  const location = useLocation();

  const isIgnoredHeaderAndFooter = useMemo(() => {
    const ignoredPathnames = ['/project'];
    if (
      ignoredPathnames.some((pathname) =>
        location.pathname.startsWith(pathname)
      )
    ) {
      return true;
    }
    return false;
  }, [location.pathname]);

  return (
    <main className="max-w-full">
      {!isIgnoredHeaderAndFooter && <Header />}
      <section className="min-h-screen bg-gray-100 dark:bg-[#1F1F1F]">
        <Outlet />
      </section>
      {!isIgnoredHeaderAndFooter && <Footer />}
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </main>
  );
};
