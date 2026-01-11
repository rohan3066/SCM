import React, { useState } from "react";
// import "../../style/form.css"; // Removing old css
import web3 from "../../ethereum/web3";
import Manufacturer from "../../ethereum/manufacturerIns";
// import "@fortawesome/fontawesome-free/css/all.css"; // Removing old css
import { toast } from "react-toastify";
import { FaUserPlus, FaCity, FaIdCard, FaStore } from "react-icons/fa";

const AddSeller = ({ address }) => {
  const [id, setId] = useState("");
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
