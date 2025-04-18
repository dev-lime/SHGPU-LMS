import React, { useState, useEffect } from 'react';
import { 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Typography,
  Switch,
  Divider,
  Avatar,
  Box,
  Grid,
  IconButton
} from "@mui/material";
import {
  AccountCircle,
  Notifications,
  Palette,
  Info,
  Brightness4,
  Brightness7
} from "@mui/icons-material";

const ColorCircle = ({ color, onClick, selected }) => (
  <IconButton onClick={onClick} sx={{ p: 0 }}>
    <Avatar sx={{ 
      bgcolor: color, 
      width: 32, 
      height: 32,
      border: selected ? '2px solid #1976d2' : 'none'
    }} />
  </IconButton>
);

export default function More() {
  const [darkMode, setDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('green');

  useEffect(() => {
    const savedColor = localStorage.getItem('primaryColor') || 'green';
    const savedMode = localStorage.getItem('themeMode') || 'light';
    setDarkMode(savedMode === 'dark');
    setPrimaryColor(savedColor);
  }, []);

  const handleThemeChange = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('themeMode', newMode ? 'dark' : 'light');
  };

  const handleColorChange = (color) => {
    setPrimaryColor(color);
    localStorage.setItem('primaryColor', color);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Настройки</Typography>
      
      <List>
        <ListItem>
          <ListItemIcon><Palette /></ListItemIcon>
          <ListItemText primary="Тема" />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Brightness7 />
            <Switch 
              checked={darkMode} 
              onChange={handleThemeChange} 
              color="primary" 
            />
            <Brightness4 />
          </Box>
        </ListItem>

        <ListItem>
          <ListItemText primary="Акцентный цвет" />
          <Grid container spacing={1}>
            {Object.entries({
              green: '#4CAF50',
              purple: '#6750A4',
              blue: '#2196F3',
              orange: '#FF9800'
            }).map(([name, color]) => (
              <Grid key={name} item> {/* Убрали item prop */}
                <ColorCircle 
                  color={color} 
                  onClick={() => handleColorChange(name)}
                  selected={primaryColor === name}
                />
              </Grid>
            ))}
          </Grid>
        </ListItem>

        <Divider sx={{ my: 2 }} />

        <ListItem component="button"> {/* Явно указываем boolean */}
          <ListItemIcon><AccountCircle /></ListItemIcon>
          <ListItemText primary="Профиль" />
        </ListItem>
      </List>
    </Box>
  );
}
