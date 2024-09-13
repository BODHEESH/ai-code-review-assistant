import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/solid';

export default function Sidebar({ threads, currentThread, activeTab, onTabChange, onThreadSelect, onThreadDelete, onNewThread, onClearHistory, sidebarWidth, onResizeMouseDown }) {
    const shortenThreadName = (name = 'New Thread', maxLength = 20) => {
        return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
    };

    return (
        <motion.aside
            className="bg-gray-100 text-black h-screen overflow-y-auto"
            style={{ width: sidebarWidth }}
            drag="x"
            dragConstraints={{ left: 200, right: 600 }}
            onDragEnd={(event, info) => {
                if (info.point.x >= 200 && info.point.x <= 600) {
                    setSidebarWidth(info.point.x);
                }
            }}
        >
            <aside className="bg-white shadow-md flex-shrink-0 overflow-hidden" style={{ width: sidebarWidth }}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Threads</h2>
                    <div className="space-x-2 flex">
                        <button onClick={onNewThread} className="px-3 py-1 bg-blue-500 text-black rounded-md hover:bg-blue-600 transition duration-200">
                            New
                        </button>
                        <span> 
                            <button onClick={onClearHistory} className="px-3 py-1 bg-red-500 text-black rounded-md hover:bg-red-600 transition duration-200 flex items-center space-x-2">
                                <TrashIcon className="h-5 w-5 text-white hover:text-black" />
                                <span>All</span>
                            </button>
                        </span>
                    </div>
                </div>
                <div className="overflow-y-auto h-full">
                    {threads.filter(thread => thread.type === activeTab).map(thread => (
                        <div key={thread.id} className={`flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer ${currentThread && currentThread.id === thread.id ? 'bg-blue-100' : ''}`}>
                            <span onClick={() => onThreadSelect(thread)} className="truncate flex-grow">
                                {shortenThreadName(thread.name)}
                            </span>
                            <XMarkIcon className="h-5 w-5 text-red-500 hover:text-red-700" onClick={() => onThreadDelete(thread)} />
                        </div>
                    ))}
                </div>
            </aside>
        </motion.aside>
    );
}
