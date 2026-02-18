import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import { useNavigate } from "react-router-dom";
import factory from "../ethereum/factory";
import web3 from "../ethereum/web3";
import { toast } from "react-toastify";
import { FaUserPlus, FaSignInAlt, FaIndustry } from "react-icons/fa";

const ManufacturerLogin = (props) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [id, setId] = useState("");
  const [brand, setBrand] = useState("");
  const [city, setCity] = useState("");
  const [pass, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/m_signup`, {
        id,
        brand,
        city,
        pass,
      });

      const accounts = await web3.eth.getAccounts();
      await factory.methods
        .createManufacturer(id, brand)
        .send({ from: accounts[0] });

      toast.success("Account Created Successfully!", { position: "top-center", autoClose: 2500 });

      props.setBrandName(brand);
      props.setCity(city);
      props.setManuId(id);

      localStorage.setItem("brandName", brand);
      localStorage.setItem("city", city);
      localStorage.setItem("manuId", id);

      try {
        const Manuaddress = await factory.methods.getManufacturerInstance(brand).call();
        props.setAddress(Manuaddress);
        localStorage.setItem("address", Manuaddress);
      } catch (e) {
        console.error("Error fetching address after signup", e);
      }

      // Auto switch to login or auto login? For now, stay on success or switch tab.
      setIsSignUp(false);

    } catch (error) {
      let errorMessage = "Error in Creating Account!";
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      toast.error(errorMessage, { position: "top-center", autoClose: 2500 });
      console.error("Error signing up:", error);
    }
    setIsLoading(false);
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/m_signin`, { id, pass });

      if (response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        const res = await axios.post(`${API_BASE_URL}/brand`, { id }, {
          headers: { Authorization: `Bearer ${response.data.accessToken}` }
        });

        props.setBrandName(res.data.manuf_brand);
        props.setCity(res.data.manuf_city);
        props.setManuId(res.data.manuf_id);

        const Manuaddress = await factory.methods
          .getManufacturerInstance(res.data.manuf_brand)
          .call();
        props.setAddress(Manuaddress);

        localStorage.setItem("brandName", res.data.manuf_brand);
        localStorage.setItem("city", res.data.manuf_city);
        localStorage.setItem("manuId", res.data.manuf_id);
        localStorage.setItem("address", Manuaddress);

        toast.success("Login Successful!", { position: "top-center", autoClose: 2000 });

        navigate("/manufacturer", {
          state: {
            brand: res.data.manuf_brand,
            id: res.data.manuf_id,
            city: res.data.manuf_city,
          },
        });
      }
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error("Login Unsuccessful! Check ID/Password.", { position: "top-center", autoClose: 2500 });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="bg-brand-darker rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-brand-gray overflow-hidden w-full max-w-4xl flex flex-col md:flex-row min-h-[600px]">

        {/* Left Side - Image/Branding */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-brand-darker to-black p-12 flex flex-col justify-center items-center text-white relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556906781-9a412961d28c?q=80&w=2670&auto=format&fit=crop')] opacity-20 bg-cover bg-center"></div>
          <div className="z-10 text-center">
            <FaIndustry className="text-6xl text-brand-orange mb-6 mx-auto" />
            <h2 className="text-4xl font-bold mb-4">Manufacturer Portal</h2>
            <p className="text-gray-400 text-lg">
              {isSignUp ? "Already a partner?" : "New to SoleGuard?"}
            </p>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="mt-8 px-8 py-3 rounded-full border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white transition-all duration-300 font-semibold uppercase tracking-wide"
            >
              {isSignUp ? "Sign In" : "Register Now"}
            </button>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-12 bg-white/5 backdrop-blur-sm flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-white mb-2 text-center">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-gray-400 text-center mb-10">
            {isSignUp ? "Register your facility" : "Access your dashboard"}
          </p>

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-6">

            {/* Inputs */}
            <div className="space-y-4">
              <input
                required
                type="text"
                placeholder="Manufacturer ID"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full bg-brand-dark border border-brand-gray text-white px-6 py-4 rounded-xl focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all placeholder-gray-500"
              />

              {isSignUp && (
                <>
                  <input
                    required
                    type="text"
                    placeholder="Brand Name"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-brand-dark border border-brand-gray text-white px-6 py-4 rounded-xl focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all placeholder-gray-500"
                  />
                  <input
                    required
                    type="text"
                    placeholder="City Location"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-brand-dark border border-brand-gray text-white px-6 py-4 rounded-xl focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all placeholder-gray-500"
                  />
                </>
              )}

              <input
                required
                type="password"
                placeholder="Password"
                value={pass}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-dark border border-brand-gray text-white px-6 py-4 rounded-xl focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all placeholder-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-orange hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg transform transition hover:scale-[1.02] duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>Processing...</>
              ) : (
                <>
                  {isSignUp ? <FaUserPlus /> : <FaSignInAlt />}
                  {isSignUp ? "Sign Up" : "Sign In"}
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ManufacturerLogin;
