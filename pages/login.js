// // pages/login.js

import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import Link from 'next/link';
import { motion } from "framer-motion";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const validateForm = () => {
        if (!email || !password) {
            toast.error("All fields are required");
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            toast.error("Please enter a valid email address");
            return false;
        }
        return true;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update last login time in Firestore
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                await updateDoc(userRef, {
                    lastLogin: new Date().toISOString(),
                });
            } else {
                // If user document doesn't exist (e.g., created through a different method), create it
                await setDoc(userRef, {
                    email: user.email,
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                });
            }
            setTimeout(() => {
                toast.success("Login successful!");
            }, 500); 

            setTimeout(() => router.push("/dashboard"), 2000);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center h-[620px] bg-gradient-to-r from-blue-500 to-teal-500"
        >
            <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl p-6 sm:p-8 md:p-10 lg:p-12 space-y-6 bg-white bg-opacity-30 backdrop-blur-lg rounded-lg shadow-lg">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900">Login</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-gray-700 text-sm sm:text-base">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-gray-700 text-sm sm:text-base">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm text-sm sm:text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </motion.button>
                </form>
                <div className="text-center">
                    <p className="text-gray-600 text-sm sm:text-base">Don't have an account? <Link href="/signup" className="text-blue-600 hover:underline">Sign up</Link></p>
                </div>
            </div>
            <ToastContainer position="top-right" />
        </motion.div>
    );
}