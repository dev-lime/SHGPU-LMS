import { useEffect, useReducer, useCallback } from 'react';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@src/firebase';

const initialState = { data: null, loading: true, error: null };

const reducer = (state, action) => {
	switch (action.type) {
		case 'FETCH_START':
			return { ...state, loading: true, error: null };
		case 'FETCH_SUCCESS':
			return { data: action.payload, loading: false, error: null };
		case 'FETCH_ERROR':
			return { data: null, loading: false, error: action.payload };
		case 'FETCH_EMPTY':
			return { data: null, loading: false, error: null };
		case 'UPDATE_DATA':
			return { ...state, data: state.data ? { ...state.data, ...action.payload } : null };
		case 'CLEAR_DATA':
			return { ...state, data: null };
		default:
			return state;
	}
};

const useFirestoreDoc = (collectionName, docId) => {
	const [state, dispatch] = useReducer(reducer, initialState);

	useEffect(() => {
		if (!docId) {
			dispatch({ type: 'FETCH_EMPTY' });
			return;
		}

		dispatch({ type: 'FETCH_START' });

		getDoc(doc(db, collectionName, docId))
			.then(docSnap => {
				if (docSnap.exists()) {
					dispatch({ type: 'FETCH_SUCCESS', payload: { id: docSnap.id, ...docSnap.data() } });
				} else {
					dispatch({ type: 'FETCH_ERROR', payload: 'Документ не найден' });
				}
			})
			.catch(err => {
				console.error(`Ошибка загрузки ${collectionName}/${docId}:`, err);
				dispatch({ type: 'FETCH_ERROR', payload: err.message || 'Не удалось загрузить данные' });
			});
	}, [collectionName, docId]);

	const update = useCallback(async (updatedData) => {
		if (!docId) throw new Error('docId не указан');
		const dataToSave = { ...updatedData, updatedAt: new Date() };
		await updateDoc(doc(db, collectionName, docId), dataToSave);
		dispatch({ type: 'UPDATE_DATA', payload: dataToSave });
	}, [collectionName, docId]);

	const remove = useCallback(async () => {
		if (!docId) throw new Error('docId не указан');
		await deleteDoc(doc(db, collectionName, docId));
		dispatch({ type: 'CLEAR_DATA' });
	}, [collectionName, docId]);

	const refetch = useCallback(() => {
		dispatch({ type: 'FETCH_START' });

		getDoc(doc(db, collectionName, docId))
			.then(docSnap => {
				if (docSnap.exists()) {
					dispatch({ type: 'FETCH_SUCCESS', payload: { id: docSnap.id, ...docSnap.data() } });
				} else {
					dispatch({ type: 'FETCH_ERROR', payload: 'Документ не найден' });
				}
			})
			.catch(err => {
				console.error(`Ошибка загрузки ${collectionName}/${docId}:`, err);
				dispatch({ type: 'FETCH_ERROR', payload: err.message || 'Не удалось загрузить данные' });
			});
	}, [collectionName, docId]);

	return { data: state.data, loading: state.loading, error: state.error, update, remove, refetch };
};

export default useFirestoreDoc;
