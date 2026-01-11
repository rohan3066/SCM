import React, { useState, useRef } from "react";
// import { Input, Button, Image } from "semantic-ui-react"; // Removing unused
import qrcode from "qrcode";
import web3 from "../../ethereum/web3";
import Manufacturer from "../../ethereum/manufacturerIns";
// import "../../style/form.css"; // Removing old css
// import "@fortawesome/fontawesome-free/css/all.css"; // Removing old css
// import { PiArrowCircleLeftFill } from "react-icons/pi";
import { toast } from "react-toastify";
import { FaBox, FaTag, FaBarcode, FaDollarSign, FaQrcode, FaDownload } from "react-icons/fa";

function AddProduct({ address }) {
  const [id, setId] = useState("");
  const [imageQR, setImageQR] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState(""); // Added state for price
  const [productImage, setProductImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const qrDescriptionRef = useRef(null);

  const generateQRCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!productImage) {
        toast.error("Please select a product image", { position: "top-center" });
        setIsLoading(false);
        return;
      }

      // 1. Upload Image
      const formData = new FormData();
      formData.append("image", productImage);

      const uploadRes = await fetch("http://localhost:3001/upload-image", {
        method: "POST",
        body: formData
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Image upload failed");
      const imageUrl = uploadData.url;

      // 2. Smart Contract Call
      const accounts = await web3.eth.getAccounts();
      const manuIns = Manufacturer(address);

      await manuIns.methods
        .addProduct(id, name, brand)
        .send({ from: accounts[0] });

      // 3. Save Image Link to Database
      await fetch("http://localhost:3001/save-product-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, brandId: brand, imageUrl })
      });

      toast.success("Product Details & Image Added Successfully!", {
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
      <div className="max-w-2xl w-full bg-brand-darker p-8 md:p-12 rounded-2xl shadow-2xl border border-brand-gray/30 backdrop-blur-sm relative overflow-hidden flex flex-col md:flex-row gap-8">

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
              <label className="block text-sm font-medium text-gray-400 mb-1">Product Price</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaDollarSign className="text-gray-500" />
                </div>
                <input
                  type="number"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-brand-gray rounded-xl bg-brand-dark text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange sm:text-sm transition-all"
                  placeholder="e.g. 200"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="relative group">
              <label className="block text-sm font-medium text-gray-400 mb-1">Product Image</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProductImage(e.target.files[0])}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-orange file:text-white hover:file:bg-orange-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Generate Products"}
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
