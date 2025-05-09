import Link from 'next/link';

const Footer = () => {
  const socialLinks = [
    { name: 'Twitter', href: '#', icon: '𝕏' },
    { name: 'Discord', href: '#', icon: '🎮' },
    { name: 'GitHub', href: '#', icon: '🐙' },
  ];

  const footerLinks = [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Contact', href: '#' },
  ];

  return (
    <footer className="bg-black/50 backdrop-blur-lg border-t border-white/10">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and description */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                RentPay
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-400">
              The future of rent payments is here. Pay your rent using cryptocurrency and let your landlord receive INR directly in their bank account.
            </p>
          </div>

          {/* Social links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Connect With Us
            </h3>
            <div className="mt-4 flex space-x-6">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <span className="text-xl">{item.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Footer links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              {footerLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
          <p className="text-center text-sm text-gray-400">
            © {new Date().getFullYear()} RentPay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 