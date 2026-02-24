import React, { useState } from "react";
import Manufacturer from "../../ethereum/manufacturerIns";
import web3 from "../../ethereum/web3";
// import "@fortawesome/fontawesome-free/css/all.css"; // Removing old css
import { toast } from "react-toastify";
import { FaBoxOpen, FaUserTie, FaIdCard, FaPaperPlane } from "react-icons/fa";
import API_BASE_URL from "../../config";

const SellToSeller = ({ address, brandName }) => {
  const [prodId, setProdId] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sell = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const accounts = await web3.eth.getAccounts();
      const manuIns = Manufacturer(address);
      const trimmedProdId = prodId.trim();
      const trimmedSellerId = sellerId.trim();

      await manuIns.methods
        .sellToSeller(trimmedProdId, trimmedSellerId)
        .send({ from: accounts[0] });

      // Synchronize database status
      try {
        await fetch(`${API_BASE_URL}/sell-to-seller`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand: brandName,
            prodId: trimmedProdId,
            sellerId: trimmedSellerId
          })
        });
      } catch (apiErr) {
        console.error("Failed to update status in DB", apiErr);
      }

      toast.success("Product Sold to Seller Successfully!", {
        position: "top-center",
        autoClose: 2500,
      });
      // Clear forms
      setProdId("");
      setSellerId("");
      setSellerName("");

    } catch (error) {
      toast.error("Error Occurred while Selling product to Seller!", {
        position: "top-center",
        autoClose: 2500,
      });
      console.error("Error selling to seller:", error);
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
            <FaPaperPlane className="h-8 w-8 text-brand-orange" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Distribute Product
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Transfer ownership to an authorized seller.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={sell}>
          <div className="space-y-4">

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
                  placeholder="e.g. PROD-001"
                  value={prodId}
                  onChange={(e) => setProdId(e.target.value)}
                />
              </div>
            </div>

            <div className="relative group">
              <label htmlFor="seller_id" className="block text-sm font-medium text-gray-400 mb-1">
                Seller ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaIdCard className="text-gray-500 group-focus-within:text-brand-orange transition-colors" />
                </div>
                <input
                  id="seller_id"
                  name="seller_id"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-brand-gray rounded-xl leading-5 bg-brand-dark text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange sm:text-sm transition-all duration-200"
                  placeholder="e.g. SELLER-X99"
                  value={sellerId}
                  onChange={(e) => setSellerId(e.target.value)}
                />
              </div>
            </div>

            <div className="relative group">
              <label htmlFor="seller_name" className="block text-sm font-medium text-gray-400 mb-1">
                Seller Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserTie className="text-gray-500 group-focus-within:text-brand-orange transition-colors" />
                </div>
                <input
                  id="seller_name"
                  name="seller_name"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-brand-gray rounded-xl leading-5 bg-brand-dark text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange sm:text-sm transition-all duration-200"
                  placeholder="e.g. FootLocker NY"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                />
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-brand-orange to-red-600 hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : "Submit Transaction"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellToSeller;
