import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

async function run() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const config = {};
        env.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length === 2) {
                config[parts[0].trim()] = parts[1].trim();
            }
        });

        const firebaseConfig = {
            apiKey: config.VITE_FIREBASE_API_KEY,
            authDomain: config.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: config.VITE_FIREBASE_PROJECT_ID,
            storageBucket: config.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: config.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: config.VITE_FIREBASE_APP_ID
        };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        console.log('Attempting to create settings/system document...');
        await setDoc(doc(db, 'settings', 'system'), {
            isMaintenanceMode: false
        });

        console.log('SUCCESS: Document created successfully.');
        process.exit(0);
    } catch (e) {
        console.error('ERROR:', e.message);
        process.exit(1);
    }
}

run();
