import { useEffect, useReducer } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@src/firebase';

const initialState = { data: [], loading: true, error: null };

const reducer = (state, action) => {
	switch (action.type) {
		case 'SET_LOADING':
			return { ...state, loading: true, error: null };
		case 'SET_DATA':
			return { data: action.payload, loading: false, error: null };
		case 'SET_EMPTY':
			return { data: [], loading: false, error: null };
		case 'SET_ERROR':
			return { data: [], loading: false, error: action.payload };
		default:
			return state;
	}
};

const useFirestoreRealtime = (collectionPath, constraints = [], deps = []) => {
	const [state, dispatch] = useReducer(reducer, initialState);

	useEffect(() => {
		if (!collectionPath) {
			dispatch({ type: 'SET_EMPTY' });
			return;
		}

		dispatch({ type: 'SET_LOADING' });

		const collectionRef = collection(db, collectionPath);
		const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;

		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
				dispatch({ type: 'SET_DATA', payload: items });
			},
			(err) => {
				console.error(`Ошибка подписки ${collectionPath}:`, err);
				dispatch({ type: 'SET_ERROR', payload: err.message || 'Ошибка загрузки данных' });
			}
		);

		return unsubscribe;
	}, [collectionPath, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

	return { data: state.data, loading: state.loading, error: state.error };
};

export default useFirestoreRealtime;
