import { useState, useCallback } from 'react';

const useField = (initialValue = '', validate = null) => {
	const [value, setValue] = useState(initialValue);
	const [error, setError] = useState(null);

	const handleChange = useCallback((e) => {
		const newValue = typeof e === 'object' && e?.target ? e.target.value : e;
		setValue(newValue);
		if (validate) {
			const result = validate(newValue);
			setError(typeof result === 'boolean' ? (result ? null : 'Некорректное значение') : result || null);
		}
	}, [validate]);

	const setValueExternal = useCallback((newValue) => {
		setValue(newValue);
		if (validate) {
			const result = validate(newValue);
			setError(typeof result === 'boolean' ? (result ? null : 'Некорректное значение') : result || null);
		}
	}, [validate]);

	const reset = useCallback(() => {
		setValue(initialValue);
		setError(null);
	}, [initialValue]);

	return { value, error, onChange: handleChange, setValue: setValueExternal, reset };
};

export default useField;
