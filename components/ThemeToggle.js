// components/ThemeToggle.js
import { useState, useEffect } from 'react';
import { SunIcon, MoonIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

export default function ThemeToggle() {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const scrollToBottom = () => {
        // Scroll to the bottom of the page
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth',
        });
    };


    return (
        <div>
            {/* <button
                onClick={toggleTheme}
                className="fixed bottom-4 right-4 bg-slate-400 text-white p-3 rounded-full shadow-md flex items-center justify-center"
            >
                {theme === 'light' ? (
                    <MoonIcon className="h-6 w-6 text-white" />
                ) : (
                    <SunIcon className="h-6 w-6 text-white" />
                )}
            </button> */}
                  {/* Scroll to Bottom Button */}
            <button
                onClick={scrollToBottom}
                className="fixed bottom-16 right-4 bg-slate-400 text-white p-3 mb-20 rounded-full shadow-md flex items-center justify-center">
                <ArrowDownIcon className="h-6 w-6 text-white" />
            </button>
        </div>
        
    );
}