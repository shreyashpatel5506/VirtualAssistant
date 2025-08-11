import React, { useState, useEffect } from "react";
import bg from "../assets/authBg.png";
import { Eye, EyeOff } from 'lucide-react';
import { authStore } from "../storevalues/auth.store.js";

const Signup = () => {
  const { sendOtp, verifyOtp, signUP, isSendOtp, isVerifyOtp, isSignup } = authStore();

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Form fields
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showpassword, setShowpassword] = useState(false);
  // Mouse movement for 3D effect
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setOffset({ x: x * 20, y: y * 20 });
    setTilt({ x: x * 100, y: y * 100 });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
    setTilt({ x: 0, y: 0 });
  };

  // Track custom cursor
  useEffect(() => {
    const move = (e) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Submit handlers
  const handleSendOtp = (e) => {
    e.preventDefault();
    if (email) sendOtp(email);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (email && otp) verifyOtp(email, otp);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (name && email && password) signUP(name, email, password);
  };

  return (
    <div
      className="relative w-full h-screen bg-cover flex items-center justify-center"
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      {/* Custom glowing cursor */}
      <div
        className="pointer-events-none fixed z-50 w-10 h-10 rounded-full border-2 border-cyan-300 shadow-[0_0_20px_rgba(0,255,255,0.6)]"
        style={{
          left: cursor.x - 20,
          top: cursor.y - 20,
        }}
      ></div>

      {/* Form container */}
      <div
        className="relative w-full max-w-md bg-white/20 p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md h-[500px] flex flex-col justify-center gap-4"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${offset.y / 2}deg) rotateY(${offset.x / 2}deg)`,
          transition: "transform 0.15s ease-out",
        }}
      >
        {/* Top-left circle */}
        <div
          className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-gradient-to-b from-cyan-300/40 to-transparent backdrop-blur-lg shadow-lg"
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
            transition: "transform 0.15s ease-out",
          }}
        ></div>

        {/* Bottom-right circle */}
        <div
          className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-t from-purple-400/40 to-transparent backdrop-blur-lg shadow-lg"
          style={{
            transform: `translate3d(${-offset.x}px, ${-offset.y}px, 0)`,
            transition: "transform 0.15s ease-out",
          }}
        ></div>

        {/* Multi-step form */}
        <form className="flex flex-col gap-4 relative z-10">
          <h1 className="text-2xl font-bold text-white mb-2">Register to VA</h1>

          {/* Step 1: Send OTP */}
          {!isSendOtp && (
            <>
              <input
                type="email"
                placeholder="Enter Email"
                className="p-3 rounded-full bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                onClick={handleSendOtp}
                className="p-3 rounded-full bg-white text-black hover:bg-white transition"
              >
                Send OTP
              </button>
            </>
          )}

          {/* Step 2: Verify OTP */}
          {isSendOtp && !isVerifyOtp && (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                className="p-3 rounded-full bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button
                onClick={handleVerifyOtp}
                className="p-3 rounded-full bg-white text-black hover:bg-white transition"
              >
                Verify OTP
              </button>
            </>
          )}

          {/* Step 3: Sign Up */}
          {isVerifyOtp && !isSignup && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                className="p-3 rounded-full bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="relative">
                <input
                  type={showpassword ? "text" : "password"}
                  placeholder="Enter Password"
                  className="w-full p-3 pr-10 rounded-full bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowpassword(!showpassword)}
                >
                  {showpassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <button
                onClick={handleSignup}
                className="p-3 rounded-full bg-white text-black hover:bg-white transition"
              >
                Sign Up
              </button>
            </>
          )}

          {/* Success message */}
          {isSignup && (
            <p className="text-green-300 text-center mt-4">
              🎉 Signup Successful! You can now login.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Signup;
