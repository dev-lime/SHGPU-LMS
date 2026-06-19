import { useState, useCallback } from 'react';

const useDialog = () => {
	const [open, setOpen] = useState(false);

	const handleOpen = useCallback(() => setOpen(true), []);
	const handleClose = useCallback(() => setOpen(false), []);
	const handleToggle = useCallback(() => setOpen(prev => !prev), []);

	return { open, handleOpen, handleClose, handleToggle, setOpen };
};

export default useDialog;
