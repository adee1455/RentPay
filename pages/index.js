import { motion } from 'framer-motion';
import { useState } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import UseCases from '../components/UseCases';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <Head>
        <title>RentPay - Pay Rent in Crypto, Get INR Instantly</title>
        <meta name="description" content="Pay your rent in crypto and get instant INR payouts. The future of rent payments is here." />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <Navbar onGetStarted={() => setIsModalOpen(true)} />
      
      <main className="relative">
        {/* Background gradient blob */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
        </div>

        <Hero onGetStarted={() => setIsModalOpen(true)} />
        <Features />
        <UseCases />
        <HowItWorks />
      </main>

      <Footer />

      <LoginModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
