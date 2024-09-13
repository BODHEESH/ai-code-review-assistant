import React from 'react';

export default function Resizer({ onMouseDown }) {
    return (
        <div
            onMouseDown={onMouseDown}
            className="w-1 bg-gray-300 cursor-col-resize hover:bg-gray-400 transition-colors duration-200"
        ></div>
    );
}
