import React, { useState, useEffect } from "react";
import Layout from "../components/layout";
import OpeningCard from "./sections.js";
// import "../style/home.css"; // Removing old css
// import "../style/heading.css"; // Removing old css

function Home() {
  const [isScrolling, setIsScrolling] = useState(false);

  // Keep scroll logic if needed, or simplify. For now, let's keep it but style the button.

  const handleClick = () => {
    const windowHeight = window.innerHeight;
    const scrollDuration = 500;
    const scrollStep = Math.round(windowHeight / (scrollDuration / 15));
    smoothScroll(scrollStep, windowHeight, scrollDuration);
  };

  const smoothScroll = (scrollStep, targetHeight, duration) => {
    setIsScrolling(true);
    let start = window.scrollY;
    let currentTime = 0;
    const increment = 20;

    function animateScroll() {
      currentTime += increment;
      const val = easeInOutQuad(currentTime, start, targetHeight, duration);
      window.scrollTo(0, val);
      if (currentTime < duration) {
        setTimeout(animateScroll, increment);
      } else {
        setIsScrolling(false);
      }
    }
    animateScroll();
  };

  const easeInOutQuad = (t, b, c, d) => {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  };

  return (
    <>
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-brand-dark text-center relative overflow-hidden">
          {/* Background decoration or image could go here */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center"></div>

          <div className="z-10 px-4">
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-gray-400 mb-6 font-sans tracking-tighter">
              Verify Your Kicks
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              The ultimate authentication system for the sneaker industry. Ensure your collection is genuine with SoleGuard.
            </p>
            <button
              className="bg-brand-orange hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105 duration-300 text-lg"
              onClick={handleClick}>
              Get Started
            </button>
          </div>
        </div>
        <OpeningCard />
      </Layout>
    </>
  );
}

export default Home;
