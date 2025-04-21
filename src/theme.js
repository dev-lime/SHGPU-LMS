import { createTheme } from '@mui/material/styles';

const materialYouColors = {
	green: '#4CAF50',
	purple: '#6750A4',
	blue: '#2196F3',
	orange: '#FF9800',
	red: '#F44336',
	pink: '#E91E63'
};

export const createAppTheme = (colorName = 'green', mode = 'light') => {
	const primaryColor = materialYouColors[colorName] || materialYouColors.green;

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
				paper: mode === 'light' ? '#FFFFFF' : '#000000',
			},
		},
		shape: {
			borderRadius: 16,
		},
		components: {
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
