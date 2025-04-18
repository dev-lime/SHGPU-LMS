// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6750A4', // Фиолетовый (можно заменить на цвет вашего вуза)
    },
    secondary: {
      main: '#958DA5', // Дополнительный цвет
    },
    background: {
      default: '#FFFBFE', // Фон приложения
      paper: '#FFFFFF',   // Фон карточек
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12, // Закругление углов
  },
});

export default theme;
