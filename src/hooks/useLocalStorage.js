import { useState, useEffect } from 'react';

const useLocalStorage = (key, initialValue) => {
	const [value, setValue] = useState(() => {
		try {
			const item = localStorage.getItem(key);
			return item !== null ? JSON.parse(item) : initialValue;
		} catch {
			return initialValue;
		}
	});

	useEffect(() => {
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (e) {
			console.error(`Ошибка записи localStorage[${key}]:`, e);
		}
	}, [key, value]);

	return [value, setValue];
};

export default useLocalStorage;
