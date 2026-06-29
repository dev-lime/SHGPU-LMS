import { useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@src/firebase';

const useLastOnline = () => {
	useEffect(() => {
		if (!auth.currentUser) return;

		const userRef = doc(db, 'users', auth.currentUser.uid);

		updateDoc(userRef, { lastOnline: serverTimestamp() });

		const handleVisibility = () => {
			updateDoc(userRef, { lastOnline: serverTimestamp() });
		};

		document.addEventListener('visibilitychange', handleVisibility);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibility);
			if (!document.hidden) {
				updateDoc(userRef, { lastOnline: serverTimestamp() });
			}
		};
	}, []);
};

export default useLastOnline;
