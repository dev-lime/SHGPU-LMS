import { useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@src/firebase';

export function useNotifications(user) {
  const lastTimestampsRef = useRef({});
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessage.timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const chatId = change.doc.id;
        const chatData = change.doc.data();
        const lastMsg = chatData.lastMessage;

        if (!lastMsg || !lastMsg.timestamp) return;

        const msgTimestamp = lastMsg.timestamp.toMillis();
        const previousTimestamp = lastTimestampsRef.current[chatId];

        if (!initializedRef.current) {
          lastTimestampsRef.current[chatId] = msgTimestamp;
          return;
        }

        if (lastMsg.sender === user.uid) return;

        if (previousTimestamp && msgTimestamp <= previousTimestamp) return;

        if (window.location.pathname === `/chat/${chatId}`) return;

        lastTimestampsRef.current[chatId] = msgTimestamp;

        const senderName = chatData.participantNames?.[lastMsg.sender] || 'Неизвестный';
        const truncatedText = lastMsg.text?.length > 100
          ? lastMsg.text.slice(0, 97) + '...'
          : lastMsg.text;

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(senderName, {
            body: truncatedText,
            icon: '/vite.svg',
            tag: chatId,
          });
        }
      });

      initializedRef.current = true;
    });

    return () => {
      unsubscribe();
      initializedRef.current = false;
      lastTimestampsRef.current = {};
    };
  }, [user]);
}
