import { useState, useCallback } from 'react';

const useSnackbar = (duration = 6000) => {
	const [message, setMessage] = useState(null);
	const [severity, setSeverity] = useState('error');

	const show = useCallback((msg, sev = 'error') => {
		setMessage(msg);
		setSeverity(sev);
	}, []);

	const hide = useCallback(() => setMessage(null), []);

	return { message, severity, show, hide, open: !!message, duration };
};

export default useSnackbar;
