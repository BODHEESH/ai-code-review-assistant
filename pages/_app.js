// pages/_app.js

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import Layout from '../components/Layout';
// import { messaging } from '../lib/firebase';
// import { getToken } from "firebase/messaging";
import { useAuth } from '../lib/useAuth.js';

function MyApp({ Component, pageProps }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user && router.pathname !== '/login' && router.pathname !== '/signup') {
                router.push('/login');
            } else if (user && (router.pathname === '/login' || router.pathname === '/signup')) {
                router.push('/dashboard');
            }
        }
    }, [user, loading, router]);

    // useEffect(() => {
    //     const initializeFirebaseMessaging = async () => {
    //         try {
    //             const permission = await Notification.requestPermission();
    //             if (permission === 'granted') {
    //                 const token = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY });
    //                 console.log('FCM Token:', token);
    //                 // Send this token to your server to associate it with the user
    //             }
    //         } catch (error) {
    //             console.error('Error initializing Firebase Messaging:', error);
    //         }
    //     };

    //     initializeFirebaseMessaging();
    // }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Layout>
            <Component {...pageProps} />
        </Layout>
    );
}

export default MyApp;