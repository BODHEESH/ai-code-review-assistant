

// components/Navbar.js

import Link from 'next/link';
import { useState } from 'react'; //
import { useAuth } from '../lib/useAuth';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import ConfirmationModal from '../components/confirmModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Navbar() {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false); 

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setTimeout(() => {
                toast.success("Logout successful!");
            }, 500); // Delay of 500ms
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const handleConfirmLogout = () => {
        handleLogout();
        setIsModalOpen(false);
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <>
            <nav className="bg-gray-700 text-white p-1">
                <div className="container mx-auto flex flex-wrap justify-between items-center">
                    <Link href="/home" className="text-2xl font-bold sm:text-xl ml-8 px-4 py-2">
                        AI Code Review Assistant
                    </Link>
                    <div className="flex flex-wrap items-center space-x-10 mt-2 sm:mt-0">
                        {user ? (
                            <>
                                <Link href="/dashboard" className="mr-4 hover:text-gray-300 ml-10">
                                    Home
                                </Link>
                                <Link href="/user" className="mr-4 hover:text-gray-300">
                                    Profile
                                </Link>
                                <ArrowPathIcon className="h-6 w-6 text-gray-500 cursor-pointer" onClick={handleRefresh} />
                                <button
                                    onClick={handleOpenModal} // Show the modal on click
                                    className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-3xl sm:pl-6"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="mr-4 hover:text-gray-300">
                                    Login
                                </Link>
                                <Link href="/signup" className="hover:text-gray-300">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                <ToastContainer position="top-right" />
            </nav>

            {/* Include the ConfirmationModal component */}
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmLogout}
                title="Confirm Logout"
                message="Are you sure you want to log out? You will be redirected to the login page."
                confirmText="Logout"
            />
        </>
    );
}

