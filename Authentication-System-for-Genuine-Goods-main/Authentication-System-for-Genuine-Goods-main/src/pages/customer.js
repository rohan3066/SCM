import React, { useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
// import "../style/customer.css"; // Removing old css
import Manufacturer from "../ethereum/manufacturerIns";
import factory from "../ethereum/factory";
import web3 from "../ethereum/web3";
import { toast } from "react-toastify";
import { FaQrcode, FaCheckCircle, FaTimesCircle, FaSearch, FaExclamationTriangle } from "react-icons/fa";
import API_BASE_URL from "../config";

const Qrcode = () => {

  const [consumerKey, setConsumerKey] = useState("");
  const [scanning, setScanning] = useState(true);
  const [productCode, setProductCode] = useState("");
  const [manufacturerCode, setManufacturerCode] = useState("");

  const [authenticationres, setAuthenticationRes] = useState("No result");
  const [active, setActive] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [productImageUrl, setProductImageUrl] = useState("");
  const [productImageUrl2, setProductImageUrl2] = useState("");
  const [productStatus, setProductStatus] = useState(null);
  const processedRef = useRef(false);

  // const openDialog = () => { ... } // Unused in this refactor if we rely on webcam

  const scanresult = (result) => {
    if (!!result && !processedRef.current) {
      processedRef.current = true;

      setScanning(false);
      const results = result.text.trim().split(/\s+/);
      const mCode = results[0] || "";
      const pCode = results[1] || "";

      setManufacturerCode(mCode);
      setProductCode(pCode);
      console.log("Scanned Data - Brand:", mCode, "Product ID:", pCode);
      toast.success("QR Code Scanned!", { position: "top-center", autoClose: 1500 });
    }
  };

  React.useEffect(() => {
    let scanner = null;
    if (scanning) {
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      scanner = new Html5Qrcode("reader");
      scanner.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          scanresult({ text: decodedText });
        },
        (errorMessage) => {
          // parse error, ignore specific errors if needed
        }
      ).catch(err => {
        console.error("Error starting scanner", err);
      });
    }

    return () => {
      if (scanner) {
        const stopScanner = async () => {
          try {
            // Check if scanner is actually running before trying to stop
            // State 2 is SCANNING, State 3 is PAUSED
            if (scanner.getState() >= 2) {
              await scanner.stop();
            }
          } catch (err) {
            // Silence "not running" errors during cleanup
            if (!err?.toString().includes("not running")) {
              console.error("Scanner stop error during cleanup:", err);
            }
          } finally {
            try {
              await scanner.clear();
            } catch (e) {
              // Ignore clear errors if they occur
            }
          }
        };
        stopScanner();
      }
    };
  }, [scanning]);

  const authenticate = async () => {
    setIsLoading(true);
    setProductStatus(null);
    setProductImageUrl("");
    setProductImageUrl2("");
    setActive("0");

    // 1. Ensure we are on Optimism Sepolia
    const chainId = await web3.eth.getChainId();
    console.log("Current Chain ID:", chainId);

    if (chainId !== 11155420n) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }],
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

    const trimmedBrand = manufacturerCode.trim();
    const trimmedProduct = productCode.trim();

    console.log(`Authenticating Brand: "${trimmedBrand}", Product: "${trimmedProduct}"`);

    try {
      // Fetch Product Status first to have it available for logic
      let currentStatus = null;
      try {
        const statusUrl = `${API_BASE_URL}/product-status?brand=${encodeURIComponent(trimmedBrand)}&product_id=${encodeURIComponent(trimmedProduct)}`;
        console.log("Fetching status from:", statusUrl);
        const statusResponse = await fetch(statusUrl);

        if (statusResponse.ok) {
          currentStatus = await statusResponse.json();
          console.log("Fetched Product Status SUCCESS:", currentStatus);
          setProductStatus(currentStatus);
        } else {
          const errorText = await statusResponse.text();
          console.warn(`Status fetch failed (${statusResponse.status}):`, errorText);
        }
      } catch (e) {
        console.error("Failed to fetch status", e);
      }

      // Fetch Image regardless of outcome (if it exists)
      try {
        const imageUrl = `${API_BASE_URL}/product-image/${encodeURIComponent(trimmedProduct)}`;
        console.log("Fetching product image from:", imageUrl);
        const imgRes = await fetch(imageUrl);
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          console.log("Fetched Product Images SUCCESS:", imgData);
          setProductImageUrl(imgData.imageUrl);
          setProductImageUrl2(imgData.imageUrl2);
        } else {
          console.warn(`Image fetch failed (${imgRes.status})`);
        }
      } catch (e) {
        console.error("Failed to fetch product image", e);
      }

      const address = await factory.methods
        .getManufacturerInstance(trimmedBrand)
        .call();

      console.log(`Manufacturer address for ${trimmedBrand}:`, address);

      if (address === "0x0000000000000000000000000000000000000000") {
        console.error("Brand not found on blockchain");
        toast.error("Brand not found on this network!", { position: "top-center", autoClose: 2500 });
        setIsLoading(false);
        return;
      }

      const manuIns = Manufacturer(address);

      // If key is provided, try to verify
      let authres = false;
      if (consumerKey) {
        authres = await manuIns.methods
          .productVerification(trimmedProduct, parseInt(consumerKey))
          .call();
      }

      if (authres) {
        setAuthenticationRes("This Product is Generic & Authentic.");
        setActive("1");
      } else {
        // Verification failed OR no key provided
        // Check if sold
        if (currentStatus && currentStatus.status === 'sold_to_consumer') {
          setAuthenticationRes("Product is sold but verification failed (Wrong code)");
          setActive("3");
        } else if (currentStatus) {
          // Product exists in DB but not sold yet
          setAuthenticationRes("Authentic Product (Pending Sale to Consumer)");
          setActive("3"); // Use warning/info state to show details
        } else {
          setAuthenticationRes("Alert! This Product might be a Counterfeit.");
          setActive("2");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Verification Failed. Please check inputs.", { position: "top-center", autoClose: 2500 });
    }
    setIsLoading(false);
  };

  const handleEnter = (event) => {
    if (event.key === "Enter") {
      authenticate();
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center py-12 px-4 text-white">
      <div className="w-full max-w-2xl text-center mb-10">
        <FaQrcode className="text-5xl text-brand-orange mx-auto mb-4" />
        <h2 className="text-4xl font-bold mb-2">Verify Your Kicks</h2>
        <p className="text-gray-400">Scan the QR code on your product and enter the consumer code to verify authenticity.</p>
      </div>

      <div className="w-full max-w-4xl bg-brand-darker rounded-2xl border border-brand-gray shadow-2xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Scanner Section */}
        <div className="flex flex-col items-center">
          <div className="w-full h-64 bg-black rounded-xl border-2 border-brand-orange/50 overflow-hidden relative shadow-[0_0_30px_rgba(255,77,77,0.1)]">
            {scanning ? (
              <div id="reader" className="w-full h-full"></div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <FaCheckCircle className="text-green-500 text-5xl mb-2" />
                <p className="absolute bottom-4 text-green-500 font-bold">Scanned Successfully</p>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setScanning(true);
              processedRef.current = false;
            }}
            className="mt-4 text-sm text-gray-400 hover:text-white underline"
          >
            Reset Scanner
          </button>
        </div>

        {/* Input Section */}
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Extracted Data</label>
            <div className="bg-brand-dark p-4 rounded-xl border border-brand-gray space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Brand:</span>
                <span className="text-white font-mono">{manufacturerCode || "---"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Product ID:</span>
                <span className="text-white font-mono">{productCode || "---"}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Consumer Code (from Box/Tag)</label>
            <input
              required
              type="text"
              placeholder="e.g., 12345"
              value={consumerKey}
              onChange={(e) => setConsumerKey(e.target.value)}
              onKeyDown={handleEnter}
              className="w-full bg-brand-dark border border-brand-gray text-white px-5 py-3 rounded-xl focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all placeholder-gray-600"
            />
          </div>

          <button
            onClick={authenticate}
            disabled={isLoading || !manufacturerCode || !productCode}
            className="w-full bg-brand-orange hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transform transition hover:scale-[1.02] duration-300 flex items-center justify-center gap-2"
          >
            {isLoading ? "Verifying..." : <><FaSearch /> Verify Authenticity</>}
          </button>
        </div>
      </div>

      {/* Result Section */}
      <div className="w-full max-w-2xl mt-10">
        {active === "1" && (
          <div className="space-y-6">
            <div className="bg-green-500/10 border border-green-500 rounded-xl p-6 flex items-center gap-4 animate-fadeIn">
              <FaCheckCircle className="text-4xl text-green-500" />
              <div>
                <h3 className="text-xl font-bold text-green-500">Authentic Product</h3>
                <p className="text-gray-300">{authenticationres}</p>
              </div>
            </div>

            {/* Product Status Display */}
            {productStatus && (
              <div className="bg-blue-500/10 border border-blue-500 rounded-xl p-6 animate-fadeIn">
                <h3 className="text-lg font-bold text-blue-400 mb-3 uppercase tracking-wider">Current Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs uppercase">Status</p>
                    <p className="text-white font-mono text-lg">{productStatus.status ? productStatus.status.replace(/_/g, " ").toUpperCase() : "UNKNOWN"}</p>
                  </div>
                  {productStatus.status === 'sold_to_consumer' ? (
                    <div>
                      <p className="text-gray-400 text-xs uppercase">Sold To</p>
                      <p className="text-brand-orange font-bold text-lg">{productStatus.soldTo || "Consumer"}</p>
                    </div>
                  ) : (
                    <div className="col-span-2">
                      <p className="text-gray-500 italic text-sm mt-1">Product not yet sold to consumer.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(productImageUrl || productImageUrl2) && (
              <div className="bg-brand-darker border border-brand-gray rounded-xl p-6 flex flex-col items-center animate-fadeIn">
                <p className="text-gray-400 mb-4 text-sm uppercase tracking-wider">Product Visuals</p>
                <div className="flex gap-4 overflow-x-auto w-full justify-center">
                  {productImageUrl && (
                    <img
                      src={productImageUrl}
                      alt="Verified Product Front"
                      className="w-full max-w-xs rounded-lg shadow-lg object-cover"
                    />
                  )}
                  {productImageUrl2 && (
                    <img
                      src={productImageUrl2}
                      alt="Verified Product Side/Back"
                      className="w-full max-w-xs rounded-lg shadow-lg object-cover"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {active === "2" && (
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 flex items-center gap-4 animate-fadeIn">
            <FaTimesCircle className="text-4xl text-red-500" />
            <div>
              <h3 className="text-xl font-bold text-red-500">Counterfeit Alert</h3>
              <p className="text-gray-300">{authenticationres}</p>
            </div>
          </div>
        )}
        {active === "3" && (
          <div className="space-y-6">
            {/* Product Status Display for Warning State */}
            {productStatus && (
              <div className="bg-blue-500/10 border border-blue-500 rounded-xl p-6 animate-fadeIn">
                <h3 className="text-lg font-bold text-blue-400 mb-3 uppercase tracking-wider">Current Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs uppercase">Status</p>
                    <p className="text-white font-mono text-lg">{productStatus.status ? productStatus.status.replace(/_/g, " ").toUpperCase() : "UNKNOWN"}</p>
                  </div>
                  {productStatus.status === 'sold_to_consumer' ? (
                    <div>
                      <p className="text-gray-400 text-xs uppercase">Sold To</p>
                      <p className="text-brand-orange font-bold text-lg">{productStatus.soldTo || "Consumer"}</p>
                    </div>
                  ) : (
                    <div className="col-span-2">
                      <p className="text-gray-500 italic text-sm mt-1">Product not yet sold to consumer.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-orange-500/10 border border-orange-500 rounded-xl p-6 flex items-center gap-4 animate-fadeIn">
              <FaExclamationTriangle className="text-4xl text-orange-500" />
              <div>
                <h3 className="text-xl font-bold text-orange-500">Verification Warning</h3>
                <p className="text-gray-300">{authenticationres}</p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default Qrcode;
