import React, { useState } from "react";
// import "../../style/form.css"; // Removing old css
import web3 from "../../ethereum/web3";
import Manufacturer from "../../ethereum/manufacturerIns";
// import "@fortawesome/fontawesome-free/css/all.css"; // Removing old css
import { toast } from "react-toastify";
import { FaUserPlus, FaCity, FaIdCard, FaStore, FaFileUpload } from "react-icons/fa";
import { parseCSV } from "../../utils/csvParser";

const AddSeller = ({ address }) => {
  const [id, setId] = useState("");
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const adding = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const accounts = await web3.eth.getAccounts();
      const manuIns = Manufacturer(address);
      await manuIns.methods
        .addSellers(id)
        .send({ from: accounts[0] });

      toast.success("Seller Details Added Successfully!", {
        position: "top-center",
        autoClose: 2500,
      });
      setId("");
      setCity("");
      setName("");
    } catch (error) {
      console.error("Error submitting transaction:", error);
      toast.error("Error in Adding Seller Details!", {
        position: "top-center",
        autoClose: 2500,
      });
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

      // Expected headers: seller_id, seller_city, seller_name
      const sellerIds = data.map(row => row.seller_id).filter(id => id);
      
      if (sellerIds.length === 0) {
        toast.error("No valid seller_id found in CSV", { position: "top-center" });
        setIsBulkLoading(false);
        return;
      }

      const accounts = await web3.eth.getAccounts();
      const manuIns = Manufacturer(address);

      await manuIns.methods
        .addSellersBatch(sellerIds)
        .send({ from: accounts[0] });

      // Note: If backend seller registration (/s_signup) is required here, 
      // it would be called, but original code doesn't do it.

      toast.success(`${sellerIds.length} Sellers Added Successfully!`, {
        position: "top-center",
        autoClose: 3500,
      });

    } catch (error) {
      console.error("Bulk upload error:", error);
      toast.error("Error in Bulk Upload: " + error.message, {
        position: "top-center",
        autoClose: 3500,
      });
    }
    setIsBulkLoading(false);
    event.target.value = null; // reset file input
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-brand-darker p-10 rounded-2xl shadow-2xl border border-brand-gray/30 backdrop-blur-sm relative overflow-hidden">

        {/* Decorative Background Element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-orange to-red-600"></div>

        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-brand-orange/10 flex items-center justify-center rounded-full mb-4">
            <FaUserPlus className="h-8 w-8 text-brand-orange" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Register New Seller
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Authorize a new retailer to sell your products.
          </p>
        </div>

        {/* Bulk Upload Section */}
        <div className="bg-brand-dark p-4 rounded-xl border border-brand-gray/50 flex flex-col items-center justify-center space-y-3">
          <label className="text-sm text-gray-400 font-medium">Bulk Upload Sellers (CSV)</label>
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
          <span className="text-xs text-gray-500 text-center">CSV format: seller_id, seller_city, seller_name</span>
          {isBulkLoading && <p className="text-brand-orange text-sm animate-pulse">Processing Bulk Upload...</p>}
        </div>

        <div className="flex items-center justify-center space-x-4">
          <hr className="w-full border-brand-gray/30" />
          <span className="text-gray-500 text-sm">OR</span>
          <hr className="w-full border-brand-gray/30" />
        </div>

        <form className="mt-8 space-y-6" onSubmit={adding}>
          <div className="space-y-4">

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
                  placeholder="e.g. SELLER-001"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />
              </div>
            </div>

            <div className="relative group">
              <label htmlFor="seller_city" className="block text-sm font-medium text-gray-400 mb-1">
                Seller City
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCity className="text-gray-500 group-focus-within:text-brand-orange transition-colors" />
                </div>
                <input
                  id="seller_city"
                  name="seller_city"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-brand-gray rounded-xl leading-5 bg-brand-dark text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange sm:text-sm transition-all duration-200"
                  placeholder="e.g. New York"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className="relative group">
              <label htmlFor="seller_name" className="block text-sm font-medium text-gray-400 mb-1">
                Seller Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaStore className="text-gray-500 group-focus-within:text-brand-orange transition-colors" />
                </div>
                <input
                  id="seller_name"
                  name="seller_name"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-brand-gray rounded-xl leading-5 bg-brand-dark text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange sm:text-sm transition-all duration-200"
                  placeholder="e.g. Sneakers Inc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-brand-orange to-red-600 hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? "Processing..." : "Add Seller"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSeller;
