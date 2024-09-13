// pages/submit-code.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function SubmitCode() {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: code, isCodeReview: true, language, description }),
            });

            const data = await response.json();

            // Save the code review to Firestore
            await addDoc(collection(db, "threads"), {
                userId: auth.currentUser.uid,
                type: 'codeReview',
                code,
                language,
                description,
                review: data.message,
                createdAt: serverTimestamp(),
            });

            router.push('/dashboard');
        } catch (error) {
            console.error('Error submitting code:', error);
            // Handle error (e.g., show error message to user)
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Submit Code for Review</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="language" className="block mb-2 font-medium">Programming Language</label>
                    <input
                        type="text"
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="description" className="block mb-2 font-medium">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 border rounded"
                        rows="3"
                        required
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label htmlFor="code" className="block mb-2 font-medium">Code</label>
                    <textarea
                        id="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full p-2 border rounded font-mono"
                        rows="10"
                        required
                    ></textarea>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Code for Review'}
                </button>
            </form>
        </div>
    );
}