// components/Layout.js
import Navbar from './Navbar';
import ThemeToggle from './ThemeToggle';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
            <ThemeToggle />
        </div>
    );
}