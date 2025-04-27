import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { getFirestore, doc, setDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Функция для регистрации с дополнительными данными
const registerWithProfile = async (email, password, profileData) => {
    try {
        // Создаем пользователя
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Форматируем Telegram URL
        let telegramUrl = profileData.telegramUrl;
        if (telegramUrl && !telegramUrl.startsWith('https://t.me/')) {
            telegramUrl = `https://t.me/${telegramUrl.replace(/^@/, '')}`;
        }

        // Сохраняем данные в Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            fullName: profileData.fullName,
            email,
            phone: profileData.phone,
            studentGroup: profileData.studentGroup,
            accountType: profileData.accountType,
            telegramUrl,
            avatarUrl: profileData.avatarUrl || null,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Обновляем профиль в Auth
        await updateProfile(userCredential.user, {
            displayName: profileData.fullName,
            photoURL: profileData.avatarUrl || null
        });

        return userCredential;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};

export {
    auth,
    db,
    storage,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    doc,
    setDoc,
    updateDoc,
    ref,
    uploadBytes,
    getDownloadURL,
    registerWithProfile
};
