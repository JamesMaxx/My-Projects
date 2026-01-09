import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />
      <div className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 py-10 w-full flex gap-6">
          <Sidebar />
          <main className="flex-1">
            <Component {...pageProps} />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
