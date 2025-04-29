import { createTheme } from '@mui/material/styles';

const materialYouColors = {
	green: '#4CAF50',
	blue: '#2196F3',
	red: '#F44336'
};

// Список тонов
const tonalSteps = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];

// Преобразование hex в HSL
const hexToHSL = (hex) => {
	let r = 0, g = 0, b = 0;
	if (hex.length === 4) {
		r = parseInt(hex[1] + hex[1], 16);
		g = parseInt(hex[2] + hex[2], 16);
		b = parseInt(hex[3] + hex[3], 16);
	} else if (hex.length === 7) {
		r = parseInt(hex[1] + hex[2], 16);
		g = parseInt(hex[3] + hex[4], 16);
		b = parseInt(hex[5] + hex[6], 16);
	}
	r /= 255;
	g /= 255;
	b /= 255;

	const max = Math.max(r, g, b), min = Math.min(r, g, b);
	let h, s, l = (max + min) / 2;

	if (max === min) {
		h = s = 0; // achromatic
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}

	return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

// Преобразование HSL обратно в hex
const hslToHex = (h, s, l) => {
	s /= 100;
	l /= 100;

	const k = n => (n + h / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	const f = n =>
		Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));

	return `#${[f(0), f(8), f(4)].map(x => x.toString(16).padStart(2, '0')).join('')}`;
};

// Генерация палитры из 13 тонов
const generateTonalPalette = (hex) => {
	const [h, s] = hexToHSL(hex);
	return tonalSteps.map(l => hslToHex(h, s, l));
};

export const createAppTheme = (colorNameOrHex = 'green', mode = 'light', borderRadius = 16) => {
	const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(colorNameOrHex);
	const primaryColor = isHex
		? colorNameOrHex
		: materialYouColors[colorNameOrHex] || materialYouColors.green;

	const tones = generateTonalPalette(primaryColor);

	return createTheme({
		palette: {
			mode,
			primary: {
				main: primaryColor,
			},
			secondary: {
				main: mode === 'light' ? '#8BC34A' : '#A5D6A7',
			},
			background: {
				default: mode === 'light' ? '#FFFBFE' : '#1C1B1F',
				paper: mode === 'light' ? '#FFFFFF' : '#313033',
			},
			tones
		},
		shape: {
			borderRadius: borderRadius,
		},
		components: {
			MuiIconButton: {
				styleOverrides: {
					root: {
						'&.Mui-selected, &:focus': { outline: 'none' },
					},
				},
			},
			MuiButton: {
				styleOverrides: {
					root: {
						'&.Mui-selected, &:focus': { outline: 'none' },
					},
				},
			},
			MuiListItem: {
				styleOverrides: {
					root: {
						'&.Mui-selected': {
							backgroundColor: 'rgba(25, 118, 210, 0.08)',
						},
					},
				},
			},
		}
	});
};

/*

Использование:

const theme = useTheme();
const tone40 = theme.palette.tones[4]; // быстрый доступ

*/

/*

return createTheme({
	palette: {
		mode,
		primary: {
			main: tones[4],
		},
		secondary: {
			main: mode === 'light' ? '#8BC34A' : '#A5D6A7',
		},
		background: {
			default: mode === 'light' ? tones[11] : tones[1],
			paper: mode === 'light' ? tones[12] : tones[3],
		}
	}
})

*/
