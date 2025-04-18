// src/theme.js
import { createTheme } from '@mui/material/styles';

// Базовые цвета Material You (можно расширить)
const materialYouColors = {
  green: '#4CAF50',
  purple: '#6750A4',
  blue: '#2196F3',
  orange: '#FF9800'
};

// Функция создания темы
export const createAppTheme = (colorName = 'green', mode = 'light') => {
  const primaryColor = materialYouColors[colorName] || materialYouColors.green;

  return createTheme({
    palette: {
      mode, // 'light' или 'dark'
      primary: {
        main: primaryColor,
      },
      secondary: {
        main: mode === 'light' ? '#8BC34A' : '#A5D6A7', // Лёгкий зелёный
      },
      background: {
        default: mode === 'light' ? '#FFFBFE' : '#1C1B1F',
        paper: mode === 'light' ? '#FFFFFF' : '#313033',
      },
    },
    shape: {
      borderRadius: 16, // Больше скругление — ближе к Material You
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
