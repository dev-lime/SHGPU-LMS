import { useState, useEffect } from 'react';
import { auth } from '@src/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const useAuthState = () => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
			setUser(firebaseUser);
			setLoading(false);
		});
		return unsubscribe;
	}, []);

	return { user, loading, isAuthenticated: !!user };
};

export default useAuthState;
