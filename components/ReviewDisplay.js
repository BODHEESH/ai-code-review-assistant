// components/ReviewDisplay.js
import { useState } from 'react';

export default function ReviewDisplay({ review }) {
    const [expandedSection, setExpandedSection] = useState(null);

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Code Review</h2>

            <div className="mb-4">
                <button
                    onClick={() => toggleSection('summary')}
                    className="w-full text-left font-semibold py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded"
                >
                    Summary
                </button>
                {expandedSection === 'summary' && (
                    <div className="mt-2 pl-4">
                        <p>{review.summary}</p>
                    </div>
                )}
            </div>

            <div className="mb-4">
                <button
                    onClick={() => toggleSection('improvements')}
                    className="w-full text-left font-semibold py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded"
                >
                    Suggested Improvements
                </button>
                {expandedSection === 'improvements' && (
                    <ul className="mt-2 pl-8 list-disc">
                        {review.improvements.map((improvement, index) => (
                            <li key={index}>{improvement}</li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="mb-4">
                <button
                    onClick={() => toggleSection('performance')}
                    className="w-full text-left font-semibold py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded"
                >
                    Performance Analysis
                </button>
                {expandedSection === 'performance' && (
                    <div className="mt-2 pl-4">
                        <p>{review.performance}</p>
                    </div>
                )}
            </div>

            <div>
                <button
                    onClick={() => toggleSection('bestPractices')}
                    className="w-full text-left font-semibold py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded"
                >
                    Best Practices
                </button>
                {expandedSection === 'bestPractices' && (
                    <ul className="mt-2 pl-8 list-disc">
                        {review.bestPractices.map((practice, index) => (
                            <li key={index}>{practice}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}