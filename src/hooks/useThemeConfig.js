import { useState, useEffect, useMemo, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { createAppTheme, getSystemTheme } from '@src/theme';

const useThemeConfig = () => {
	const [color, setColor] = useLocalStorage('primaryColor', 'green');
	const [mode, setMode] = useLocalStorage('themeMode', 'light');
	const [borderRadius, setBorderRadius] = useLocalStorage('borderRadius', 16);
	const [tabLabelsMode, setTabLabelsMode] = useLocalStorage('tabLabelsMode', 'showAll');
	const [systemTheme, setSystemTheme] = useState(getSystemTheme());

	useEffect(() => {
		const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = (e) => setSystemTheme(e.matches ? 'dark' : 'light');

		darkModeMediaQuery.addEventListener('change', handleChange);
		return () => darkModeMediaQuery.removeEventListener('change', handleChange);
	}, []);

	const theme = useMemo(() =>
		createAppTheme(color, mode, borderRadius),
		[color, mode, borderRadius]
	);

	const handleThemeChange = useCallback((newConfig) => {
		if (newConfig.color !== undefined) setColor(newConfig.color);
		if (newConfig.mode !== undefined) setMode(newConfig.mode);
		if (newConfig.borderRadius !== undefined) setBorderRadius(newConfig.borderRadius);
	}, [setColor, setMode, setBorderRadius]);

	return {
		theme,
		color,
		mode,
		borderRadius,
		systemTheme,
		tabLabelsMode,
		setTabLabelsMode,
		handleThemeChange
	};
};

export default useThemeConfig;
