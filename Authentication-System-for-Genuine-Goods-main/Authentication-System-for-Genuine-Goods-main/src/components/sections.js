import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaIndustry, FaStore } from "react-icons/fa"; // Assuming react-icons is installed or will be. If not, I'll use text or SVG. 
// Actually, I should check package.json for react-icons. It was there (v5.0.1).

// import "../style/home.css"; // Removing old css
// import "../style/m_login.css"; // Removing old css
// import "../style/Pages2_Cards.css"; // Removing old css
// import "../style/s_login.css"; // Removing old css

const OpeningCard = () => {
  // const navigate = useNavigate(); // Unused

  const cards = [
    {
      title: "Consumer",
      role: "Verify Authenticity",
      desc: "Scan and verify your sneakers to ensure they are 100% authentic. Protect your collection from counterfeits.",
      link: "/consumerlogin",
      icon: <FaUserShield className="text-4xl text-brand-orange mb-4" />,
      img: "/img/customer2.png"
    },
    {
      title: "Manufacturer",
      role: "Register Products",
      desc: "Secure your brand by registering authentic products on the blockchain. Build trust and eliminate fakes.",
      link: "/manufacturerlogin",
      icon: <FaIndustry className="text-4xl text-brand-orange mb-4" />,
      img: "/img/manuf2.png"
    },
    {
      title: "Seller",
      role: "Distribute Genuine Goods",
      desc: "Verify products before selling and maintain a reputation for selling only genuine sneakers.",
      link: "/sellerlogin",
      icon: <FaStore className="text-4xl text-brand-orange mb-4" />,
      img: "/img/seller2.png"
    }
  ];

  return (
    <div className="bg-brand-darker py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-white mb-16 uppercase tracking-widest">Choose Your Role</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {cards.map((card, index) => (
            <a
              key={index}
              href={card.link}
              className="block group relative bg-brand-dark rounded-2xl p-8 border border-brand-gray hover:border-brand-orange transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(255,77,77,0.3)] flex flex-col items-center text-center overflow-hidden"
            >
              <div className="z-10 flex flex-col items-center">
                {card.icon}
                <h3 className="text-2xl font-bold text-white mb-2">{card.title}</h3>
                <h4 className="text-brand-orange font-medium mb-4">{card.role}</h4>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  {card.desc}
                </p>
                <span className="text-brand-light font-semibold text-sm group-hover:text-brand-orange transition-colors">Enter Portal &rarr;</span>
              </div>

              {/* Optional: Use the image as a subtle background or remove if not needed. 
                  Let's keep it subtle or just use the icon. The previous code used images. 
                  I Will try to use the image as a faint background.
              */}
              {/* <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 opacity-10 rounded-full bg-brand-orange blur-3xl group-hover:opacity-20 transition-opacity"></div> */}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OpeningCard;
