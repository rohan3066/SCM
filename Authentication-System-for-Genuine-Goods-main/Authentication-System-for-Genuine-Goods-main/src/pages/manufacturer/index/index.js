import React, { useState } from "react";
// import "./manuf_options.css"; // Removing old css
import { useLocation, useNavigate } from "react-router-dom";
import {
  BsFillGrid3X3GapFill,
  BsCart3,
  BsGrid1X2Fill,
  BsPeopleFill,
  BsFillArchiveFill,
} from "react-icons/bs";
import { FaSignOutAlt, FaPlus, FaUserPlus, FaExchangeAlt, FaBars, FaTimes } from "react-icons/fa";
import API_BASE_URL from "../../config";

function Manuf() {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  const location = useLocation();
  const { brand, id, city } = location.state || {};
  const navigate = useNavigate();

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };

  const handleAddProduct = () => navigate("./addProduct");
  const handleAddSeller = () => navigate("./addSeller");
  const handleSelltoSeller = () => navigate("./selltoseller");

  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);

  React.useEffect(() => {
    if (brand) {
      fetch(`${API_BASE_URL}/manufacturer/products/${brand}`)
        .then(res => res.json())
        .then(data => setProducts(data))
        .catch(err => console.error("Failed to fetch products", err));
    }

    fetch(`${API_BASE_URL}/all-sellers`)
      .then(res => res.json())
      .then(data => setSellers(data))
      .catch(err => console.error("Failed to fetch sellers", err));
  }, [brand]);

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col md:flex-row text-white">

      {/* Sidebar - Made responsive */}
      <aside className={`${openSidebarToggle ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative z-50 w-64 h-screen bg-brand-darker border-r border-brand-gray transition-transform duration-300 ease-in-out`}>
        <div className="p-6 flex items-center justify-between border-b border-brand-gray">
          <div className="flex items-center gap-2 text-brand-orange font-bold text-xl uppercase tracking-wider">
            <BsCart3 className="text-2xl" /> SoleGuard
          </div>
          <span className="md:hidden cursor-pointer text-gray-400 hover:text-white" onClick={OpenSidebar}>
            <FaTimes />
          </span>
        </div>
        <ul className="p-4 space-y-4">
          <li>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-orange text-white font-medium shadow-lg hover:bg-orange-600 transition-colors">
              <BsGrid1X2Fill /> Dashboard
            </a>
          </li>
          <li>
            <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
              <BsFillGrid3X3GapFill /> Home
            </a>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Welcome, Manufacturer
          </h2>
          <button className="md:hidden text-2xl" onClick={OpenSidebar}><FaBars /></button>
        </div>

        {/* Profile Details Card */}
        <div className="bg-brand-darker rounded-2xl p-8 border border-brand-gray shadow-lg mb-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange opacity-5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <div className="flex-1 space-y-3 relative z-10 w-full">
            <h3 className="text-xl font-semibold text-brand-orange mb-4 border-b border-brand-gray pb-2">Profile Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-brand-dark p-4 rounded-xl border border-brand-gray/50">
                <p className="text-gray-400 text-sm">Brand Identity</p>
                <p className="text-white text-lg font-medium">{brand || "N/A"}</p>
              </div>
              <div className="bg-brand-dark p-4 rounded-xl border border-brand-gray/50">
                <p className="text-gray-400 text-sm">Manufacturer ID</p>
                <p className="text-white text-lg font-medium font-mono">{id || "N/A"}</p>
              </div>
              <div className="bg-brand-dark p-4 rounded-xl border border-brand-gray/50">
                <p className="text-gray-400 text-sm">Location</p>
                <p className="text-white text-lg font-medium">{city || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Add Product */}
          <div className="bg-brand-darker p-8 rounded-2xl border border-brand-gray hover:border-brand-orange transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
              <FaPlus className="text-blue-500 text-2xl" />
            </div>
            <h3 className="text-xl font-bold mb-3">Add Product</h3>
            <p className="text-gray-400 text-sm mb-6 h-20">
              Register new product details (ID, Brand, Name) to generate authentication QR codes.
            </p>
            <button
              onClick={handleAddProduct}
              className="w-full py-3 rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all font-semibold uppercase text-sm tracking-wide"
            >
              Add Product
            </button>
          </div>

          {/* Add Seller */}
          <div className="bg-brand-darker p-8 rounded-2xl border border-brand-gray hover:border-brand-orange transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 bg-brand-orange/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-orange/20 transition-colors">
              <FaUserPlus className="text-brand-orange text-2xl" />
            </div>
            <h3 className="text-xl font-bold mb-3">Add Seller</h3>
            <p className="text-gray-400 text-sm mb-6 h-20">
              Authorize new sellers by registering their ID and location in the system.
            </p>
            <button
              onClick={handleAddSeller}
              className="w-full py-3 rounded-lg border border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white transition-all font-semibold uppercase text-sm tracking-wide"
            >
              Add Seller
            </button>
          </div>

          {/* Sell Product */}
          <div className="bg-brand-darker p-8 rounded-2xl border border-brand-gray hover:border-brand-orange transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
              <FaExchangeAlt className="text-green-500 text-xl" />
            </div>
            <h3 className="text-xl font-bold mb-3">Distribute</h3>
            <p className="text-gray-400 text-sm mb-6 h-20">
              Record shipments of authenticated products to registered sellers.
            </p>
            <button
              onClick={handleSelltoSeller}
              className="w-full py-3 rounded-lg border border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-all font-semibold uppercase text-sm tracking-wide"
            >
              Sell Stock
            </button>
          </div>

        </div>

        {/* Dashboard Data Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

          {/* Products Section */}
          <div className="bg-brand-darker rounded-2xl p-6 border border-brand-gray shadow-lg">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BsFillArchiveFill className="text-brand-orange" /> Your Products
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {products.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No products added yet.</p>
              ) : (
                products.map((prod) => (
                  <div key={prod.product_id} className="bg-brand-dark p-4 rounded-xl border border-brand-gray flex items-center gap-4 hover:border-brand-orange transition-colors">
                    <div className="w-16 h-16 bg-black rounded-lg overflow-hidden flex-shrink-0">
                      {prod.image_url ? (
                        <img src={prod.image_url} alt={prod.product_id} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600"><BsFillArchiveFill /></div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white">{prod.product_id}</p>
                      <p className="text-gray-400 text-sm">{brand}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sellers Section */}
          <div className="bg-brand-darker rounded-2xl p-6 border border-brand-gray shadow-lg">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BsPeopleFill className="text-blue-500" /> Registered Sellers
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {sellers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No sellers registered.</p>
              ) : (
                sellers.map((seller, idx) => (
                  <div key={idx} className="bg-brand-dark p-4 rounded-xl border border-brand-gray flex items-center justify-between hover:border-blue-500 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                        {seller.seller_id.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white">{seller.seller_id}</p>
                        <p className="text-gray-400 text-sm">{seller.seller_city}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold">Active</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main >
    </div >
  );
}
export default Manuf;
