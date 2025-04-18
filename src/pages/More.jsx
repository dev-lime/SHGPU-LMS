import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Divider,
	Switch,
	Radio,
	RadioGroup,
	FormControlLabel,
	Avatar,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	IconButton
} from "@mui/material";
import {
	Settings,
	Palette,
	Brightness4,
	Brightness7,
	Edit
} from "@mui/icons-material";

const ProfileSection = () => {
	const [userInitial] = useState('А');

	return (
		<Box sx={{
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			py: 3,
			position: 'relative'
		}}>
			<IconButton
				sx={{
					position: 'absolute',
					right: 16,
					top: 16,
					bgcolor: 'background.paper'
				}}
			>
				<Edit fontSize="small" />
			</IconButton>

			<Avatar
				sx={{
					width: 96,
					height: 96,
					fontSize: 40,
					mb: 2,
					bgcolor: 'primary.main',
					cursor: 'pointer'
				}}
			>
				{userInitial}
			</Avatar>

			<Typography variant="h6" align="center">
				Артем Дедюхин
			</Typography>
			<Typography variant="body2" color="text.secondary" align="center">
				Студент, ИИТТиЕН
			</Typography>
		</Box>
	);
};

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

	const handleColorChange = (event) => {
		const color = event.target.value;
		setPrimaryColor(color);
		localStorage.setItem('primaryColor', color);
	};

	const colorOptions = {
		green: '#4CAF50',
		purple: '#6750A4',
		blue: '#2196F3',
		orange: '#FF9800',
		red: '#F44336',
		pink: '#E91E63'
	};

	return (
		<Box sx={{ pb: 2 }}>
			<ProfileSection />

			<Divider sx={{ my: 2 }} />

			<Typography variant="h6" sx={{ px: 2, mb: 1 }}>Быстрые настройки</Typography>

			<List disablePadding>
				<ListItem>
					<ListItemIcon sx={{ minWidth: 40 }}>
						<Palette color="primary" />
					</ListItemIcon>
					<ListItemText primary="Цветовая схема" />
					<RadioGroup
						row
						value={primaryColor}
						onChange={handleColorChange}
						sx={{ ml: 2 }}
					>
						{Object.entries(colorOptions).map(([name, color]) => (
							<FormControlLabel
								key={name}
								value={name}
								control={
									<Radio
										size="small"
										sx={{
											color,
											'&.Mui-checked': { color },
										}}
									/>
								}
								label=""
								sx={{ mr: 0 }}
							/>
						))}
					</RadioGroup>
				</ListItem>

				<ListItem>
					<ListItemIcon sx={{ minWidth: 40 }}>
						{darkMode ? <Brightness4 color="primary" /> : <Brightness7 color="primary" />}
					</ListItemIcon>
					<ListItemText primary="Тёмная тема" />
					<Switch
						checked={darkMode}
						onChange={handleThemeChange}
						color="primary"
					/>
				</ListItem>
			</List>

			<Divider sx={{ my: 2 }} />

			<Typography variant="h6" sx={{ px: 2, mb: 1 }}>Настройки</Typography>

			<List disablePadding>
				<ListItem component="div">
					<ListItemIcon sx={{ minWidth: 40 }}>
						<Settings color="primary" />
					</ListItemIcon>
					<ListItemText
						primary="Все настройки"
						secondary="Дополнительные параметры"
					/>
				</ListItem>
			</List>
		</Box>
	);
}
