import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaUserPlus, FaSignInAlt, FaStore } from "react-icons/fa";
// import "../style/s_login.css"; // Removing old css

const SellerLogin = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [id, setId] = useState("");
  const [city, setCity] = useState("");
  const [pass, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/s_signup`, {
        id,
        city,
        pass,
      });

      toast.success("Account Created Successfully!", { position: "top-center", autoClose: 2500 });
      setIsSignUp(false);

    } catch (error) {
      console.error("Error signing up:", error);
      toast.error("Error in Creating Account!", { position: "top-center", autoClose: 2500 });
    }
    setIsLoading(false);
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/s_signin`, { id, pass });

      if (response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        toast.success("Logged In Successfully!", { position: "top-center", autoClose: 2500 });
        navigate("/selltoConsumer");
      }
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error("Error in SignIn! Check Creds.", { position: "top-center", autoClose: 2500 });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="bg-brand-darker rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-brand-gray overflow-hidden w-full max-w-4xl flex flex-col md:flex-row min-h-[600px]">

        {/* Left Side - Image/Branding */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-brand-darker to-black p-12 flex flex-col justify-center items-center text-white relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=2525&auto=format&fit=crop')] opacity-20 bg-cover bg-center"></div>
          <div className="z-10 text-center">
            <FaStore className="text-6xl text-brand-orange mb-6 mx-auto" />
            <h2 className="text-4xl font-bold mb-4">Seller Portal</h2>
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
            {isSignUp ? "Create Account" : "Seller Login"}
          </h2>
          <p className="text-gray-400 text-center mb-10">
            {isSignUp ? "Join our network" : "Manage your sales"}
          </p>

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-6">

            {/* Inputs */}
            <div className="space-y-4">
              <input
                required
                type="text"
                placeholder="Seller ID"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full bg-brand-dark border border-brand-gray text-white px-6 py-4 rounded-xl focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all placeholder-gray-500"
              />

              {isSignUp && (
                <input
                  required
                  type="text"
                  placeholder="Seller City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-gray text-white px-6 py-4 rounded-xl focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all placeholder-gray-500"
                />
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

export default SellerLogin;
