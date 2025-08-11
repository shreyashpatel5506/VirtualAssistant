import React, { useState, useEffect } from "react";
import bg from "../assets/authBg.png";
import { authStore } from "../storevalues/auth.store.js";
import React from "react";

const Login = () => {
    const { login, isLogin } = authStore();
    const [showpassword, setShowpassword] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [cursor, setCursor] = useState({ x: 0, y: 0 });

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Mouse move 3D effect
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setOffset({ x: x * 20, y: y * 20 });
    };

    const handleMouseLeave = () => setOffset({ x: 0, y: 0 });

    // Custom glowing cursor
    useEffect(() => {
        const move = (e) => setCursor({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", move);
        return () => window.removeEventListener("mousemove", move);
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (email && password) {
            login(email, password);
        }
    };

    return (
        <div
            className="relative w-full h-screen bg-cover flex items-center justify-center"
            style={{ backgroundImage: `url(${bg})` }}
        >
            {/* Glowing cursor */}
            <div
                className="pointer-events-none fixed z-50 w-10 h-10 rounded-full border-2 border-cyan-300 shadow-[0_0_20px_rgba(0,255,255,0.6)]"
                style={{
                    left: cursor.x - 20,
                    top: cursor.y - 20,
                }}
            ></div>

            {/* Form container */}
            <div
                className="relative w-full max-w-md bg-white/20 p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md h-[400px] flex flex-col justify-center gap-4"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    transform: `rotateX(${offset.y / 2}deg) rotateY(${offset.x / 2}deg)`,
                    transition: "transform 0.15s ease-out",
                }}
            >
                {/* Decorative Circles */}
                <div
                    className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-gradient-to-b from-cyan-300/40 to-transparent backdrop-blur-lg shadow-lg"
                    style={{
                        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
                        transition: "transform 0.15s ease-out",
                    }}
                ></div>
                <div
                    className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-t from-purple-400/40 to-transparent backdrop-blur-lg shadow-lg"
                    style={{
                        transform: `translate3d(${-offset.x}px, ${-offset.y}px, 0)`,
                        transition: "transform 0.15s ease-out",
                    }}
                ></div>

                {/* Form */}
                <form className="flex flex-col gap-4 relative z-10">
                    <h1 className="text-2xl font-bold text-white mb-2">Login to VA</h1>

                    <input
                        type="email"
                        placeholder="Enter Email"
                        className="p-3 rounded-lg border-1-white border-radius-100 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Enter Password"
                        className="p-3 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        onClick={() => setShowpassword(!showpassword)}
                    >
                        {showpassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                    <button
                        onClick={handleLogin}
                        className="p-3 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition"
                    >
                        Login
                    </button>

                    {isLogin && (
                        <p className="text-green-300 text-center mt-4">
                            🎉 Login Successful!
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Login;
