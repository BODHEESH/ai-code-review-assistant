import { getMessaging } from "firebase-admin/messaging";
import { initializeApp, getApps, cert } from "firebase-admin/app";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
    });
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { token, title, body } = req.body;

        try {
            const message = {
                notification: {
                    title,
                    body,
                },
                token,
            };

            const response = await getMessaging().send(message);
            res.status(200).json({ success: true, response });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}