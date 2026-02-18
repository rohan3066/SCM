import React, { useRef, useState } from "react";
// import "../../style/form.css"; // Removing old css
import web3 from "../../ethereum/web3";
import Manufacturer from "../../ethereum/manufacturerIns";
import factory from "../../ethereum/factory";
import axios from "axios";
// import "@fortawesome/fontawesome-free/css/all.css"; // Removing old css
import { toast } from "react-toastify";
import { FaTag, FaBoxOpen, FaEnvelope, FaShoppingCart } from "react-icons/fa";
import API_BASE_URL from "../../config";

const SellToCustomer = () => {
  const [brand, setBrand] = useState("");
  const [prodId, setProdId] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const signRef = useRef(null);

  const sold = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Ensure we are on Optimism Sepolia (Chain ID 11155420) BEFORE fetching data
    const chainId = await web3.eth.getChainId();
    if (chainId !== 11155420n) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], // 11155420 in hex
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          toast.error("Please add OP Sepolia Testnet to MetaMask!", { position: "top-center" });
        } else {
          toast.error("Please switch to OP Sepolia Testnet!", { position: "top-center" });
        }
        setIsLoading(false);
        return;
      }
    }

    try {
      // 2. Now that we are on the right network, check the brand
      const address = await factory.methods
        .getManufacturerInstance(brand.trim())
        .call();

      if (address === "0x0000000000000000000000000000000000000000") {
        toast.error("Brand not found!", { position: "top-center", autoClose: 2500 });
        setIsLoading(false);
        return;
      }

      const accounts = await web3.eth.getAccounts();

      const consumerCode = Math.floor(Math.random() * 1000000);

      // Attempt backend call but fallback gracefully if it fails? 
      // User didn't ask to fix this but good practice. sticking to existing flow.
      await axios.post(`${API_BASE_URL}/sendEmail`, {
        brand,
        prodId,
        email,
        consumerCode,
      });

      const manuIns = Manufacturer(address);
      await manuIns.methods
        .sellToConsumer(prodId, consumerCode)
        .send({ from: accounts[0] });

      toast.success("Product Sold & Code Sent to Email!", {
        position: "top-center",
        autoClose: 2500
      });

      // Clear inputs
      setBrand("");
      setProdId("");
      setEmail("");

    } catch (error) {
      console.error(error);
      toast.error("Transaction Failed or Email Service Error!", {
        position: "top-center",
        autoClose: 2500
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-brand-darker p-10 rounded-2xl shadow-2xl border border-brand-gray/30 backdrop-blur-sm relative overflow-hidden">

        {/* Decorative Background Element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-orange to-red-600"></div>

        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-brand-orange/10 flex items-center justify-center rounded-full mb-4">
            <FaShoppingCart className="h-8 w-8 text-brand-orange" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Sell to Consumer
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Complete the sale and generate a digital certificate.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={sold}>
          <div className="space-y-4">

            <div className="relative group">
              <label htmlFor="manuf_brand" className="block text-sm font-medium text-gray-400 mb-1">
                Manufacturer Brand
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaTag className="text-gray-500 group-focus-within:text-brand-orange transition-colors" />
                </div>
                <input
                  id="manuf_brand"
                  name="manuf_brand"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-brand-gray rounded-xl leading-5 bg-brand-dark text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange sm:text-sm transition-all duration-200"
                  placeholder="e.g. Nike"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
            </div>

            <div className="relative group">
              <label htmlFor="product_id" className="block text-sm font-medium text-gray-400 mb-1">
                Product ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaBoxOpen className="text-gray-500 group-focus-within:text-brand-orange transition-colors" />
                </div>
                <input
                  id="product_id"
                  name="product_id"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-brand-gray rounded-xl leading-5 bg-brand-dark text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange sm:text-sm transition-all duration-200"
                  placeholder="e.g. PROD-123"
                  value={prodId}
                  onChange={(e) => setProdId(e.target.value)}
                />
              </div>
            </div>

            <div className="relative group">
              <label htmlFor="cust_email" className="block text-sm font-medium text-gray-400 mb-1">
                Customer Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-500 group-focus-within:text-brand-orange transition-colors" />
                </div>
                <input
                  id="cust_email"
                  name="cust_email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-brand-gray rounded-xl leading-5 bg-brand-dark text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange sm:text-sm transition-all duration-200"
                  placeholder="client@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-brand-orange to-red-600 hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? "Processing Sale..." : "Confirm Sale"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellToCustomer;
