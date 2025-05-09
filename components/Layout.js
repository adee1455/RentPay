import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const router = useRouter();
  const isHomePage = router.pathname === '/';
  const isDashboardPage = router.pathname === '/rent-dashboard';
  const isTransactionsPage = router.pathname === '/transactions';
  const isAnalyticsPage = router.pathname === '/analytics';


  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
      {/* Background gradient blob */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
      </div>

      <Navbar onGetStarted={() => router.push('/')} />

      {/* Back button for non-home pages and non-dashboard pages */}
      {!isHomePage && !isDashboardPage && !isTransactionsPage && !isAnalyticsPage &&(
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/')}
          className="fixed top-24 left-4 z-50 flex items-center space-x-2 px-4 py-2 bg-black/50 border border-white/10 rounded-lg hover:bg-white/5 transition-colors backdrop-blur-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Home</span>
        </motion.button>
      )}

      <main className="flex-1 relative pt-16">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout; 