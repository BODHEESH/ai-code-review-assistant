// pages/home.js

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import MainContent from '../components/MainContent';
import Sidebar from '../components/Sidebar';
import Resizer from '../components/Resizer';
import Header from '../components/Header';
import SubmitModal from '../components/codeSubmitModal';
import ConfirmationModal from '../components/confirmModal';
import ThreadModal from '../components/ThreadModal';
import { motion, AnimatePresence } from 'framer-motion';
import Spinner from '../components/spinner'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const SIDEBAR_MIN_WIDTH = 200;
const SIDEBAR_MAX_WIDTH = 600;


export default function Home() {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [user, setUser] = useState(null);
    const [threads, setThreads] = useState([]);
    const [currentThread, setCurrentThread] = useState(null);
    const [activeTab, setActiveTab] = useState('codeReview');
    const [newThreadName, setNewThreadName] = useState('');
    const [sidebarWidth, setSidebarWidth] = useState(300);
    const [isResizing, setIsResizing] = useState(false);
    const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [isSubmitModalOpen, setSubmitModalOpen] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [threadToDelete, setThreadToDelete] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isNewThreadModalOpen, setNewThreadModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
                fetchThreads(user.uid);
            } else {
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router]);

    const fetchThreads = useCallback((userId) => {
        const threadsRef = collection(db, 'threads');
        const q = query(
            threadsRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, (querySnapshot) => {
            const fetchedThreads = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setThreads(fetchedThreads);

            if (!currentThread && fetchedThreads.length > 0) {
                setCurrentThread(fetchedThreads[0]);
            }
        }, (error) => {
            console.error('Error fetching threads:', error);
            // Implement proper error handling/notification here
        });
    }, [currentThread]);

    const handleResizeMouseDown = (e) => {
        e.preventDefault();
        setIsResizing(true);
    };

    const handleMouseMove = useCallback((e) => {
        if (isResizing) {
            const newWidth = e.clientX;
            if (newWidth >= SIDEBAR_MIN_WIDTH && newWidth <= SIDEBAR_MAX_WIDTH) {
                setSidebarWidth(newWidth);
            }
        }
    }, [isResizing]);

    const handleMouseUp = () => {
        setIsResizing(false);
    };

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove]);

    const handleThreadSelect = (thread) => {
        setCurrentThread(thread);
    };

    const handleThreadDelete = (thread) => {
        setThreadToDelete(thread);
        setConfirmationModalOpen(true);
    };

    const handleClearHistory = async () => {
        if (window.confirm('Are you sure you want to clear all threads? This action cannot be undone.')) {
            try {
                const threadsToDelete = threads.filter(thread => thread.type === activeTab);
                for (const thread of threadsToDelete) {
                    await deleteDoc(doc(db, 'threads', thread.id));
                }
                setThreads(prevThreads => prevThreads.filter(thread => thread.type !== activeTab));
                setCurrentThread(null);
            } catch (error) {
                console.error('Error clearing history:', error);
                // Implement proper error handling/notification here
            }
        }
    };

    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
            // Implement proper error handling/notification here
        }
    };

    const handleOpenSubmitModal = () => {
        setSubmitModalOpen(true);
    };

    const handleSubmit = async (data) => {
        // setLoading(true);

        try {
            let threadName = activeTab === 'codeReview'
                ? `Code Review: ${data.language}`
                : data.chatMessage.slice(0, 30) + (data.chatMessage.length > 20 ? '...' : '');

            const newThread = createNewThread(user, activeTab, threadName);
            const docRef = await addDoc(collection(db, 'threads'), newThread);
            newThread.id = docRef.id;

            const prompt = activeTab === 'codeReview' ? generateCodeReviewPrompt(data) : data.chatMessage;
            const assistantResponse = await submitToApi(prompt, activeTab === 'codeReview', data.language, data.description);

            if (activeTab === 'codeReview') {
                newThread.questions.push({ code: data.code, language: data.language, description: data.description });
            } else {
                newThread.questions.push({ chatMessage: data.chatMessage });
            }
            newThread.responses.push(assistantResponse);

            await updateFirebaseThread(newThread);
            setThreads(prevThreads => [newThread, ...prevThreads]);
            setCurrentThread(newThread);
            setSubmitModalOpen(false);
            console.log(currentThread)
            console.log(threads)
            window.location.reload();
        } catch (error) {
            console.error('Error submitting:', error);
            // Implement proper error handling/notification here
        } finally {
            // setLoading(false);
        }
    };

    const submitToApi = async (prompt, isCodeReview, language = '', description = '') => {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: prompt, isCodeReview, language, description }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            setTimeout(() => {
                toast.success("Your answer is here!");
            }, 500); const responseData = await response.json();

            return responseData.message || 'No response received';
        } catch (error) {
            console.error('There was an error with the request:', error);
            throw error;
        }
    };

    const confirmDeleteThread = async () => {
        if (threadToDelete) {
            // setLoading(true);
            try {
                await deleteDoc(doc(db, 'threads', threadToDelete.id));
                setThreads(prevThreads => prevThreads.filter(thread => thread.id !== threadToDelete.id));
                if (currentThread && currentThread.id === threadToDelete.id) {
                    const remainingThreads = threads.filter(thread => thread.id !== threadToDelete.id);
                    setCurrentThread(remainingThreads.length > 0 ? remainingThreads[0] : null);
                }
                
            } catch (error) {
                console.error('Error deleting thread:', error);
                // Implement proper error handling/notification here
            }
        }
        setConfirmationModalOpen(false);
        setThreadToDelete(null);
        // setLoading(false);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };


    return (
        <div className="flex h-screen overflow-hidden">
            {isLoading && <Spinner />}
            <ToastContainer position="top-right" />
            {isSidebarOpen && (
                <AnimatePresence>
                    <motion.div
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="lg:block"
                        style={{ width: sidebarWidth }}
                    >
                        <Sidebar
                            threads={threads}
                            currentThread={currentThread}
                            activeTab={activeTab}
                            onTabChange={handleTabSwitch}
                            onThreadSelect={handleThreadSelect}
                            onThreadDelete={handleThreadDelete}
                            onNewThread={handleOpenSubmitModal}
                            onClearHistory={handleClearHistory}
                            sidebarWidth={sidebarWidth}
                            onResizeMouseDown={handleResizeMouseDown}
                        />
                    </motion.div>
                </AnimatePresence>
            )}
            {isSidebarOpen && <Resizer onMouseDown={handleResizeMouseDown} />}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    activeTab={activeTab}
                    onTabSwitch={handleTabSwitch}
                    onLogout={handleLogout}
                    toggleSidebar={toggleSidebar}
                    isSidebarOpen={isSidebarOpen}
                />
                <MainContent
                    currentThread={currentThread}
                    activeTab={activeTab}
                    onOpenSubmitModal={handleOpenSubmitModal}
                    isLoading={isLoading}
                />
            </div>
            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={() => setConfirmationModalOpen(false)}
                onConfirm={confirmDeleteThread}
                title="Confirm Logout"
                message="Are you sure you want to delete this thread?"
                confirmText="Delete"
            />
            <SubmitModal
                isOpen={isSubmitModalOpen}
                onClose={() => setSubmitModalOpen(false)}
                onSubmit={handleSubmit}
                activeTab={activeTab}
                isLoading={isLoading}
            />
        </div>
    );
}

// Helper functions
const createNewThread = (user, threadType, name) => ({
    userId: user.uid,
    name: name,
    type: threadType,
    questions: [],
    responses: [],
    createdAt: new Date()
});

const generateCodeReviewPrompt = (data) => {
    return `Language: ${data.language}\nDescription: ${data.description}\nCode:\n${data.code}\n\nPlease review this code, focusing on:
    1. Potential optimizations for efficiency, performance, and readability.
    2. Time and space complexity analysis.
    3. Identification of any mistakes or bugs.
    4. Suggestions for optimization, including alternative approaches.
    5. Scalability and edge case considerations.
    6. Improvements for structure, maintainability, and coding standards.
    7. A revised version of the code (if applicable) with explanations for changes.`;
};

const submitToApi = async (prompt, isCodeReview, language = '', description = '') => {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: prompt, isCodeReview, language, description }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        return responseData.message || 'No response received';
    } catch (error) {
        console.error('There was an error with the request:', error);
        throw error;
    }
};

const updateFirebaseThread = async (thread) => {
    await updateDoc(doc(db, 'threads', thread.id), {
        questions: thread.questions,
        responses: thread.responses,
        name: thread.name
    });
};
