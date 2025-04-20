import React, { useState } from 'react';
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
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions
} from "@mui/material";
import {
	Settings,
	Palette,
	Brightness4,
	Brightness7,
	Info,
	HelpOutline,
	ExitToApp,
	Description
} from "@mui/icons-material";

const ProfileSection = ({ user }) => {
	const userInitial = user?.email?.charAt(0).toUpperCase() || 'П';

	return (
		<Box sx={{
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			py: 3,
			position: 'relative'
		}}>
			<Avatar
				sx={{
					width: 96,
					height: 96,
					mb: 2,
					bgcolor: 'primary.main',
					fontSize: 40
				}}
			>
				{userInitial}
			</Avatar>

			<Typography variant="h6" align="center">
				{user?.email || 'Пользователь'}
			</Typography>
			<Typography variant="body2" color="text.secondary" align="center">
				{user?.uid ? 'Аккаунт активирован' : 'Гостевой режим'}
			</Typography>
		</Box>
	);
};

export default function More({ themeConfig, onThemeChange, user, onLogout }) {
	const [primaryColor, setPrimaryColor] = useState(themeConfig?.color || 'green');
	const [darkMode, setDarkMode] = useState(themeConfig?.mode === 'dark');
	const [aboutOpen, setAboutOpen] = useState(false);

	const colorOptions = {
		green: '#4CAF50',
		purple: '#6750A4',
		blue: '#2196F3',
		orange: '#FF9800',
		red: '#F44336',
		pink: '#E91E63'
	};

	const handleColorChange = (event) => {
		const color = event.target.value;
		setPrimaryColor(color);
		onThemeChange({ ...themeConfig, color });
	};

	const handleThemeChange = (event) => {
		const mode = event.target.checked ? 'dark' : 'light';
		setDarkMode(event.target.checked);
		onThemeChange({ ...themeConfig, mode });
	};

	const handleAboutOpen = () => setAboutOpen(true);
	const handleAboutClose = () => setAboutOpen(false);

	return (
		<Box sx={{
			pb: 2,
			display: 'flex',
			flexDirection: 'column',
			height: '100%'
		}}>
			<ProfileSection user={user} />

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
				<ListItem
					component={Button}
					onClick={() => console.log('Help clicked')}
					sx={{
						textTransform: 'none',
						color: 'text.primary',
						'&:hover': {
							backgroundColor: 'action.hover'
						},
						'&.Mui-selected': {
							outline: 'none'
						},
						'&:focus': {
							outline: 'none'
						}
					}}
				>
					<ListItemIcon sx={{ minWidth: 40 }}>
						<Description color="primary" />
					</ListItemIcon>
					<ListItemText primary="Документы" />
				</ListItem>

				<ListItem
					component={Button}
					onClick={() => console.log('All settings clicked')}
					sx={{
						textTransform: 'none',
						color: 'text.primary',
						'&:hover': {
							backgroundColor: 'action.hover'
						},
						'&.Mui-selected': {
							outline: 'none'
						},
						'&:focus': {
							outline: 'none'
						}
					}}
				>
					<ListItemIcon sx={{ minWidth: 40 }}>
						<Settings color="primary" />
					</ListItemIcon>
					<ListItemText
						primary="Все настройки"
						secondary="Дополнительные параметры"
					/>
				</ListItem>

				<ListItem
					component={Button}
					onClick={() => console.log('Help clicked')}
					sx={{
						textTransform: 'none',
						color: 'text.primary',
						'&:hover': {
							backgroundColor: 'action.hover'
						},
						'&.Mui-selected': {
							outline: 'none'
						},
						'&:focus': {
							outline: 'none'
						}
					}}
				>
					<ListItemIcon sx={{ minWidth: 40 }}>
						<HelpOutline color="primary" />
					</ListItemIcon>
					<ListItemText primary="Помощь" />
				</ListItem>

				<ListItem
					component={Button}
					onClick={handleAboutOpen}
					sx={{
						textTransform: 'none',
						color: 'text.primary',
						'&:hover': {
							backgroundColor: 'action.hover'
						},
						'&.Mui-selected': {
							outline: 'none'
						},
						'&:focus': {
							outline: 'none'
						}
					}}
				>
					<ListItemIcon sx={{ minWidth: 40 }}>
						<Info color="primary" />
					</ListItemIcon>
					<ListItemText primary="О приложении" />
				</ListItem>

				{user?.uid && (
					<ListItem
						component={Button}
						onClick={onLogout}
						sx={{
							textTransform: 'none',
							color: 'error.main',
							'&:hover': {
								backgroundColor: 'action.hover'
							},
							'&.Mui-selected': {
								outline: 'none'
							},
							'&:focus': {
								outline: 'none'
							}
						}}
					>
						<ListItemIcon sx={{ minWidth: 40 }}>
							<ExitToApp color="error" />
						</ListItemIcon>
						<ListItemText primary="Выйти из аккаунта" />
					</ListItem>
				)}
			</List>

			<Dialog
				open={aboutOpen}
				onClose={handleAboutClose}
				maxWidth="xs"
				fullWidth
				PaperProps={{
					sx: {
						borderRadius: 3,
						bgcolor: 'background.paper',
						p: 1
					}
				}}
			>
				<DialogTitle sx={{
					typography: 'h6',
					color: 'text.primary',
					px: 3,
					pt: 3
				}}>
					О приложении
				</DialogTitle>
				<DialogContent sx={{
					px: 3,
					py: 1
				}}>
					<Box sx={{
						display: 'flex',
						flexDirection: 'column',
						gap: 2
					}}>
						<Typography variant="body1" component="div" color="text.primary">
							<Box component="span" sx={{ fontWeight: 600 }}>SHGPU-LMS</Box>
						</Typography>
						<Typography variant="body2" component="div" color="text.secondary">
							Учебная платформа Шадринского государственного педагогического университета
						</Typography>
						<Typography variant="caption" display="block" color="text.secondary">
							Версия 0.2 Demo
						</Typography>
					</Box>
				</DialogContent>
				<DialogActions sx={{
					px: 3,
					py: 2,
					justifyContent: 'right'
				}}>
					<Button
						onClick={handleAboutClose}
						color="primary"
						variant="contained"
						sx={{
							textTransform: 'none',
							borderRadius: 2,
							px: 3,
							py: 1,
							minWidth: 120,
							'&.Mui-selected': {
								outline: 'none'
							},
							'&:focus': {
								outline: 'none'
							}
						}}
						autoFocus
					>
						Закрыть
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
