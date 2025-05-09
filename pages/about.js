import { motion } from 'framer-motion';
import Layout from '@/components/Layout';

const founders = [
  {
    name: "Adee Shaikh",
    role: "Co-Founder & CEO",
    image: "/adee.jpeg", // You'll need to add these images
    bio: "Adee is a full-stack web developer and co-founder of Jade Studios, with a strong passion for Web3, blockchain, and AI. He has built impactful projects like Streetbyte, DeFile, and RentPay, and continues to develop innovative blockchain-based solutions. Adee is known for blending technical expertise with entrepreneurial vision.",
    linkedin: "https://www.linkedin.com/in/adeeshaikh/",
    twitter: "https://x.com/adees_eth"
  },
  {
    name: "Jay Jadhav",
    role: "Co-Founder & CTO",
    image: "/jj.jpeg", // You'll need to add these images
    bio: "Jay is a full-stack web developer and co-founder of Jade Studios, specializing in blockchain and scalable web applications. He has co-developed multiple projects with Adee, including DeFile, RentPay, and others. Jay stands out for his strong problem-solving skills and deep technical proficiency across the stack.",
    linkedin: "https://www.linkedin.com/in/jay-jadhav-a06909198/",
    twitter: "https://x.com/Jay_Jadhav_"
  }
];

export default function About() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-8">
            About RentPay
          </h1>
          
          <div className="prose prose-invert max-w-none mb-16">
            <p className="text-xl text-gray-300 mb-6">
              RentPay is revolutionizing the way rent payments are made by bridging the gap between cryptocurrency and traditional fiat payments. Our mission is to make crypto payments accessible and practical for everyday use.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-white mb-12">Our Founders</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {founders.map((founder, index) => (
              <motion.div
                key={founder.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-black/30 border border-white/10 rounded-2xl p-8 backdrop-blur-lg"
              >
                <div className="aspect-square w-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white/10">
                  <img
                    src={founder.image}
                    alt={founder.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <h3 className="text-2xl font-bold text-white text-center mb-2">
                  {founder.name}
                </h3>
                
                <p className="text-blue-400 text-center mb-6">
                  {founder.role}
                </p>
                
                <p className="text-gray-300 mb-6">
                  {founder.bio}
                </p>
                
                <div className="flex justify-center space-x-4">
                  <a
                    href={founder.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                  <a
                    href={founder.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-8">Our Mission</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              We're building the future of rent payments by making cryptocurrency accessible and practical for everyday use. Our platform bridges the gap between digital assets and traditional fiat payments, making it easier than ever for tenants and landlords to transact.
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
} 