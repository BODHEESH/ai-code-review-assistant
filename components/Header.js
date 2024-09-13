

import React from 'react';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';

export default function Header({ activeTab, onTabSwitch, onLogout, toggleSidebar, isSidebarOpen }) {
    return (
        <header className="bg-white shadow-md p-4 flex items-center justify-between">
            <div className="flex items-center">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleSidebar}
                    className="lg:hidden mr-4"
                >
                    <Menu size={24} />
                </motion.button>
            </div>
            <div className="flex space-x-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-md ${activeTab === 'codeReview' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => onTabSwitch('codeReview')}
                >
                    Code Review
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-md ${activeTab === 'chat' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => onTabSwitch('chat')}
                >
                    Chat
                </motion.button>
            </div>
        </header>
    );
}
