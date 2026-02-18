
import React, { useState, useRef } from "react";
// import { Input, Button, Image } from "semantic-ui-react"; // Removing unused
import qrcode from "qrcode";
import web3 from "../../ethereum/web3";
import Manufacturer from "../../ethereum/manufacturerIns";
// import "../../style/form.css"; // Removing old css
// import "@fortawesome/fontawesome-free/css/all.css"; // Removing old css
// import { PiArrowCircleLeftFill } from "react-icons/pi";
import { toast } from "react-toastify";
import { FaBox, FaTag, FaBarcode, FaDollarSign, FaQrcode, FaDownload, FaImage } from "react-icons/fa";

import API_BASE_URL from "../../config";

function AddProduct({ address }) {
  const [id, setId] = useState("");
  const [imageQR, setImageQR] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");

  // Image States
  const [productImage, setProductImage] = useState(null);
  const [productImage2, setProductImage2] = useState(null); // New State for 2nd Image

  const [isLoading, setIsLoading] = useState(false);
  const qrDescriptionRef = useRef(null);

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${API_BASE_URL}/upload-image`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Image upload failed");
    return data.url;
  };

  const generateQRCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!productImage) {
        toast.error("Please select at least the primary product image", { position: "top-center" });
        setIsLoading(false);
        return;
      }

      // 1. Upload Images
      let imageUrl1 = "";
      let imageUrl2 = "";

      try {
        imageUrl1 = await handleImageUpload(productImage);
      } catch (err) {
        throw new Error("Failed to upload primary image: " + err.message);
      }

      if (productImage2) {
        try {
          imageUrl2 = await handleImageUpload(productImage2);
        } catch (err) {
          console.warn("Failed to upload second image", err);
          // We can choose to fail or continue. Let's warning toast but continue? 
          // Better to fail so data is consistent.
          throw new Error("Failed to upload second image: " + err.message);
        }
      }

      // 2. Smart Contract Call
      const accounts = await web3.eth.getAccounts();
      const manuIns = Manufacturer(address);

      await manuIns.methods
        .addProduct(id, name, brand)
        .send({ from: accounts[0] });

      // 3. Save Image Links to Database
      await fetch(`${API_BASE_URL}/save-product-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          brandId: brand,
          imageUrl: imageUrl1,
          imageUrl2: imageUrl2
        })
      });

      toast.success("Product Details & Images Added Successfully!", {
        position: "top-center",
        autoClose: 2500,
      });

      const qrdata = brand + " " + id;
      const imageDataURL = await qrcode.toDataURL(qrdata);
      setImageQR(imageDataURL);

      if (qrDescriptionRef.current) {
        qrDescriptionRef.current.innerHTML = "Click the QR Code to Download";
      }

    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error(error.message || "Error in Adding Product Details!", {
        position: "top-center",
        autoClose: 3000,
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-brand-darker p-8 md:p-12 rounded-2xl shadow-2xl border border-brand-gray/30 backdrop-blur-sm relative overflow-hidden flex flex-col md:flex-row gap-8">

        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-orange to-red-600"></div>

        {/* Form Section */}
        <div className="flex-1 space-y-6">
          <div className="text-left">
            <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <FaBox className="text-brand-orange" />
              Add Product
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Register a new product on the blockchain.
            </p>
          </div>

          <form className="space-y-4" onSubmit={generateQRCode}>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-400 mb-1">Brand Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaTag className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-brand-gray rounded-xl bg-brand-dark text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange sm:text-sm transition-all"
                    placeholder="e.g. Nike"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-sm font-medium text-gray-400 mb-1">Product Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBox className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-brand-gray rounded-xl bg-brand-dark text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange sm:text-sm transition-all"
                    placeholder="e.g. Air Jordan 1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-400 mb-1">Product ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBarcode className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-brand-gray rounded-xl bg-brand-dark text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange sm:text-sm transition-all"
                    placeholder="e.g. AJ1-2024-001"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-sm font-medium text-gray-400 mb-1">Price ($)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaDollarSign className="text-gray-500" />
                  </div>
                  <input
                    type="number"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-brand-gray rounded-xl bg-brand-dark text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange sm:text-sm transition-all"
                    placeholder="200"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-sm font-medium text-gray-400">Product Images</label>

              {/* Primary Image */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaImage className="text-brand-orange" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProductImage(e.target.files[0])}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-orange/20 file:text-brand-orange hover:file:bg-brand-orange/30 pl-10 border border-brand-gray/50 rounded-xl"
                />
                <span className="text-xs text-gray-500 mt-1 block pl-1">Primary View (Required)</span>
              </div>

              {/* Secondary Image */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaImage className="text-gray-500" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProductImage2(e.target.files[0])}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600 pl-10 border border-brand-gray/50 rounded-xl"
                />
                <span className="text-xs text-gray-500 mt-1 block pl-1">Secondary View (Optional)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange transition-all duration-300 disabled:opacity-50 mt-4"
            >
              {isLoading ? "Processing..." : "Generate & Upload"}
            </button>
          </form>
        </div>

        {/* QR Code Section */}
        <div className="flex-1 flex flex-col items-center justify-center border-l border-brand-gray/30 pl-0 md:pl-8 mt-8 md:mt-0">
          {!imageQR ? (
            <div className="flex flex-col items-center text-gray-500">
              <FaQrcode className="text-6xl mb-4 opacity-20" />
              <p>QR Code will appear here</p>
            </div>
          ) : (
            <div className="text-center animate-fadeIn">
              <p className="text-brand-orange font-bold mb-4" ref={qrDescriptionRef}>Click QR to Download</p>
              <div className="p-4 bg-white rounded-xl shadow-lg inline-block group relative">
                <a href={imageQR} download={`product-${id}.png`}>
                  <img src={imageQR} alt="Product QR Code" className="w-48 h-48 block" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl cursor-pointer">
                    <FaDownload className="text-white text-3xl" />
                  </div>
                </a>
              </div>
              <p className="mt-4 text-xs text-gray-400">Print this tag for your product</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default AddProduct;
