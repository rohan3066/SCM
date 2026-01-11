import React, { useState } from "react";
import { Link } from "react-router-dom";
// import "../style/header.css"; // Removing old css for now to avoid conflicts

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between flex-wrap bg-brand-dark p-6 shadow-md border-b border-brand-gray">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <span className="font-semibold text-xl tracking-tight text-brand-orange uppercase tracking-wider">SoleGuard</span>
      </div>
      <div className="block lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center px-3 py-2 border rounded text-brand-light border-brand-light hover:text-brand-orange hover:border-brand-orange">
          <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" /></svg>
        </button>
      </div>
      <div className={`w-full block flex-grow lg:flex lg:items-center lg:w-auto ${isOpen ? '' : 'hidden'}`}>
        <div className="text-sm lg:flex-grow">
          <Link to="/" className="block mt-4 lg:inline-block lg:mt-0 text-brand-light hover:text-brand-orange mr-4 font-medium">
            Home
          </Link>
          <Link to="/about" className="block mt-4 lg:inline-block lg:mt-0 text-brand-light hover:text-brand-orange mr-4 font-medium">
            About
          </Link>
          <Link to="/contact" className="block mt-4 lg:inline-block lg:mt-0 text-brand-light hover:text-brand-orange font-medium">
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Header;
