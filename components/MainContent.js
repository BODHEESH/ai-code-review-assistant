
// // components/MainContent

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MainContent({ currentThread, activeTab, onOpenSubmitModal, isLoading, onSubmit }) {
    const formatResponse = (response) => {
        const formatted = response.replace(/\n/g, '<br/>');
        return formatted.replace(/```(.*?)```/gs, (match, p1) => `<pre><code>${p1}</code></pre>`);
    };

    const messageVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <AnimatePresence>
                {currentThread ? (
                    <motion.div
                        key={currentThread.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                    >
                        {currentThread.questions.map((q, index) => (
                            <motion.div
                                key={index}
                                className="space-y-2"
                                initial="hidden"
                                animate="visible"
                                variants={messageVariants}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <div className="bg-white p-4 rounded-lg shadow-md">
                                    <p className="font-semibold text-indigo-600">User:</p>
                                    <p className="mt-1">
                                        {activeTab === 'codeReview'
                                            ? `Language: ${q.language}\nDescription: ${q.description}\nCode:\n${q.code}`
                                            : q.chatMessage}
                                    </p>
                                </div>
                                {currentThread.responses[index] && (
                                    <div className="bg-indigo-50 p-4 rounded-lg shadow-md">
                                        <p className="font-semibold text-indigo-600">Assistant:</p>
                                        <div
                                            className="mt-1 prose max-w-none"
                                            dangerouslySetInnerHTML={{ __html: formatResponse(currentThread.responses[index]) }}
                                        />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-center text-gray-500 mt-10"
                    >
                        <p className="text-xl">Start a new conversation!</p>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 sticky bottom-6"
            >
                <button
                    onClick={onOpenSubmitModal}
                    className="w-full p-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : null}
                    {isLoading ? 'Processing...' : `${activeTab === 'codeReview' ? 'Submit Code for Review' : 'Send Message'}`}
                </button>
            </motion.div>
        </main>
    );
}