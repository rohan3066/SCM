import React from 'react';
// import '../style/footer.css'; // Removed in favor of Tailwind

function Footer() {
  return (
    <footer className="bg-brand-darker text-brand-light py-10 border-t border-brand-gray">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">

        {/* Contact Section */}
        <div className="flex flex-col items-center md:items-start">
          <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">Contact SoleGuard</h2>
          <p className="mb-2 text-gray-400">Email: <a href="mailto:support@soleguard.com" className="text-brand-orange hover:text-white transition-colors">support@soleguard.com</a></p>
          <p className="mb-2 text-gray-400">Phone: +1 (555) 123-4567</p>
          <p className="text-gray-400">123 Sneaker St, Innovation City, Tech State</p>
        </div>

        {/* Services Section */}
        <div className="flex flex-col items-center md:items-start">
          <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">Our Services</h2>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-brand-orange transition-colors">Authenticity Verification</a></li>
            <li><a href="#" className="hover:text-brand-orange transition-colors">Blockchain Registration</a></li>
            <li><a href="#" className="hover:text-brand-orange transition-colors">Marketplace Integration</a></li>
          </ul>
        </div>

        {/* Social Media Section */}
        <div className="flex flex-col items-center md:items-start">
          <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">Follow Us</h2>
          <ul className="flex space-x-6 justify-center md:justify-start">
            <li><a href="/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-orange text-lg transition-colors">Facebook</a></li>
            <li><a href="/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-orange text-lg transition-colors">Twitter</a></li>
            <li><a href="/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-orange text-lg transition-colors">Instagram</a></li>
          </ul>
        </div>
      </div>

      <div className="text-center mt-12 pt-8 border-t border-brand-gray text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} SoleGuard. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
