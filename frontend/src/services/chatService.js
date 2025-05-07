import { db, auth } from '@src/firebase';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from 'firebase/firestore';

export const createOrGetChat = async (userId) => {
    try {
        if (!auth.currentUser) {
            throw new Error('User not authenticated');
        }

        if (userId === auth.currentUser.uid) {
            throw new Error('Cannot create chat with yourself');
        }

        // Проверяем существующий чат
        const chatsRef = collection(db, 'chats');
        const q = query(
            chatsRef,
            where('participants', 'array-contains', auth.currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        const existingChat = querySnapshot.docs.find(doc => {
            const participants = doc.data().participants;
            return participants.includes(userId);
        });

        if (existingChat) {
            return existingChat.id; // Возвращаем ID существующего чата
        }

        // Получаем данные пользователя
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.exists() ? userDoc.data() : {};
        const userName = userData.fullName || userData.email || 'Unknown';

        // Создаем новый чат
        const newChatRef = doc(chatsRef);
        await setDoc(newChatRef, {
            participants: [auth.currentUser.uid, userId],
            participantNames: {
                [auth.currentUser.uid]: auth.currentUser.displayName || 'You',
                [userId]: userName
            },
            createdAt: serverTimestamp(),
            lastMessage: {
                text: 'Chat created',
                sender: auth.currentUser.uid,
                timestamp: serverTimestamp()
            },
            lastUpdated: serverTimestamp()
        });

        return newChatRef.id; // Возвращаем ID нового чата
    } catch (error) {
        console.error("Error in createOrGetChat:", error);
        throw error;
    }
};
