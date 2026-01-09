import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Header from '../components/Header';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Component {...pageProps} />
      </main>
      <footer className="bg-gray-100 py-4 text-center">© GitConnect</footer>
    </div>
  );
}
