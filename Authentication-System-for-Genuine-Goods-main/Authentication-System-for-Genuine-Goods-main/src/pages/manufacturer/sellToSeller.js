import React, { useState } from "react";
import Manufacturer from "../../ethereum/manufacturerIns";
import web3 from "../../ethereum/web3";
// import "@fortawesome/fontawesome-free/css/all.css"; // Removing old css
import { toast } from "react-toastify";
import { FaBoxOpen, FaUserTie, FaIdCard, FaPaperPlane, FaFileUpload } from "react-icons/fa";
import API_BASE_URL from "../../config";
import { parseCSV } from "../../utils/csvParser";

const SellToSeller = ({ address, brandName }) => {
  const [prodId, setProdId] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

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

  const handleBulkUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsBulkLoading(true);
    try {
      const data = await parseCSV(file);
      if (data.length === 0) {
        toast.error("CSV is empty", { position: "top-center" });
        setIsBulkLoading(false);
        return;
      }

      // Expected headers: product_id, seller_id
      const validRows = data.filter(row => row.product_id && row.seller_id);
      
      if (validRows.length === 0) {
        toast.error("No valid product_id or seller_id found in CSV", { position: "top-center" });
        setIsBulkLoading(false);
        return;
      }

      const prodIds = validRows.map(row => row.product_id);
      const sellerIds = validRows.map(row => row.seller_id);

      const accounts = await web3.eth.getAccounts();
      const manuIns = Manufacturer(address);

      // 1. Smart Contract Batch Call
      await manuIns.methods
        .sellToSellersBatch(prodIds, sellerIds)
        .send({ from: accounts[0] });

      // 2. Synchronize database status in bulk
      const updates = validRows.map(row => ({
        prodId: row.product_id,
        sellerId: row.seller_id
      }));

      try {
        await fetch(`${API_BASE_URL}/sell-to-seller-batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand: brandName,
            updates: updates
          })
        });
      } catch (apiErr) {
        console.error("Failed to update bulk status in DB", apiErr);
      }

      toast.success(`${validRows.length} Products Distributed Successfully!`, {
        position: "top-center",
        autoClose: 3500,
      });

    } catch (error) {
      console.error("Bulk distribution error:", error);
      toast.error("Error in Bulk Distribution: " + error.message, {
        position: "top-center",
        autoClose: 3500,
      });
    }
    setIsBulkLoading(false);
    event.target.value = null;
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

        {/* Bulk Upload Section */}
        <div className="bg-brand-dark p-4 rounded-xl border border-brand-gray/50 flex flex-col items-center justify-center space-y-3">
          <label className="text-sm text-gray-400 font-medium">Bulk Distribute (CSV)</label>
          <div className="relative group w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFileUpload className="text-brand-orange" />
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleBulkUpload}
              disabled={isBulkLoading || isLoading}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-orange/20 file:text-brand-orange hover:file:bg-brand-orange/30 pl-10 border border-brand-gray/50 rounded-xl"
            />
          </div>
          <span className="text-xs text-gray-500 text-center">CSV format: product_id, seller_id</span>
          {isBulkLoading && <p className="text-brand-orange text-sm animate-pulse">Processing Bulk Distribution...</p>}
        </div>

        <div className="flex items-center justify-center space-x-4">
          <hr className="w-full border-brand-gray/30" />
          <span className="text-gray-500 text-sm">OR</span>
          <hr className="w-full border-brand-gray/30" />
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
