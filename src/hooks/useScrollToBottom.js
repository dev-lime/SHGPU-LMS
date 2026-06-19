import { useCallback, useRef } from 'react';

const useScrollToBottom = () => {
	const containerRef = useRef(null);

	const scrollToBottom = useCallback((behavior = 'smooth') => {
		const el = containerRef.current;
		if (el) {
			el.scrollTo({
				top: el.scrollHeight,
				behavior
			});
		}
	}, []);

	const scrollToElement = useCallback((elementRef, block = 'center') => {
		if (elementRef?.current) {
			elementRef.current.scrollIntoView({ behavior: 'smooth', block });
		}
	}, []);

	return { containerRef, scrollToBottom, scrollToElement };
};

export default useScrollToBottom;
