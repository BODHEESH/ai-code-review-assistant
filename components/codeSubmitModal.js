// // Modal Component for code submission

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubmitModal({ isOpen, onClose, onSubmit, activeTab, isLoading }) {
    const [formData, setFormData] = useState({
        code: '',
        language: '',
        description: '',
        chatMessage: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
                    >
                        <h2 className="text-2xl font-bold mb-4">
                            {activeTab === 'codeReview' ? 'Submit Code for Review' : 'Send a Message'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            {activeTab === 'codeReview' ? (
                                <>
                                    <input
                                        type="text"
                                        name="language"
                                        placeholder="Programming Language"
                                        onChange={handleChange}
                                        className="w-full p-2 mb-4 border rounded"
                                        required
                                    />
                                    <textarea
                                        name="description"
                                        placeholder="Description of the code"
                                        onChange={handleChange}
                                        className="w-full p-2 mb-4 border rounded"
                                        required
                                    ></textarea>
                                    <textarea
                                        name="code"
                                        placeholder="Paste your code here"
                                        onChange={handleChange}
                                        className="w-full p-2 mb-4 border rounded"
                                        required
                                    ></textarea>
                                </>
                            ) : (
                                <textarea
                                    name="chatMessage"
                                    placeholder="Type your message"
                                    onChange={handleChange}
                                    className="w-full p-2 mb-4 border rounded"
                                    required
                                ></textarea>
                            )}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}