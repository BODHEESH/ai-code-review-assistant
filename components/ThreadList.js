import React from 'react';

export default function ThreadList({ threads, currentThread, onThreadSelect, onThreadDelete }) {
    return (
        <div>
            {threads.map(thread => (
                <div
                    key={thread.id}
                    className={`flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer ${currentThread && currentThread.id === thread.id ? 'bg-blue-100' : ''}`}
                >
                    <span onClick={() => onThreadSelect(thread)} className="truncate flex-grow">
                        {thread.name}
                    </span>
                    <XMarkIcon
                        className="h-5 w-5 text-red-500 hover:text-red-700"
                        onClick={() => onThreadDelete(thread)}
                    />
                </div>
            ))}
        </div>
    );
}
    