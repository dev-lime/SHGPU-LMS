import React from 'react';
import {
	Box,
	Typography,
	Paper,
	List,
	ListItem,
	ListItemText,
	Divider,
	Avatar
} from '@mui/material';
import {
	Description,
	Settings,
	HelpOutline,
	AccountCircle,
	CreditCard
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ProfileSection = ({ user, onClick }) => {
	const userInitial = user?.email?.charAt(0).toUpperCase() || 'П';

	return (
		<ListItem
			onClick={onClick}
			sx={{
				py: 2,
				px: 2,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				'&:hover': {
					backgroundColor: 'action.hover',
					cursor: 'pointer'
				}
			}}
		>
			<Avatar
				sx={{
					width: 96,
					height: 96,
					mb: 2,
					bgcolor: 'primary.main',
					fontSize: 40,
					'&:hover': {
						opacity: 0.8,
						transition: 'opacity 0.2s ease-in-out'
					}
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
		</ListItem>
	);
};

export default function More({ user, onLogout }) {
	const navigate = useNavigate();

	const menuItems = [
		{
			name: "Предъявить студенческий",
			icon: <CreditCard color="primary" />,
			onClick: () => console.log("student")
		},
		{
			name: "Документы",
			description: "Шаблоны для печати",
			icon: <Description color="primary" />,
			onClick: () => navigate('/documents')
		},
		{
			name: "Настройки",
			description: "Персонализация и параметры",
			icon: <Settings color="primary" />,
			onClick: () => navigate('/settings')
		},
		{
			name: "Помощь",
			icon: <HelpOutline color="primary" />,
			onClick: () => navigate('/support')
		}
	];

	return (
		<Box sx={{
			padding: { xs: 2, sm: 3 },
			display: 'flex',
			flexDirection: 'column',
			height: '100%'
		}}>
			<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
				<AccountCircle color="primary" sx={{ mr: 1 }} />
				<Typography variant="h6" sx={{ fontWeight: 600 }}>Профиль</Typography>
			</Box>

			<Paper elevation={0} sx={{
				borderRadius: 3,
				border: '1px solid',
				overflow: 'hidden',
				borderColor: 'divider',
				mb: 3
			}}>
				<List disablePadding>
					<ProfileSection
						user={user}
						onClick={() => navigate('/profile')}
					/>
				</List>
			</Paper>

			<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
				<Settings color="primary" sx={{ mr: 1 }} />
				<Typography variant="h6" sx={{ fontWeight: 600 }}>Меню</Typography>
			</Box>

			<Paper elevation={0} sx={{
				borderRadius: 3,
				border: '1px solid',
				overflow: 'hidden',
				borderColor: 'divider'
			}}>
				<List disablePadding>
					{menuItems.map((item, index) => (
						<React.Fragment key={index}>
							<ListItem
								onClick={item.onClick}
								sx={{
									py: 2,
									px: 2,
									'&:hover': {
										backgroundColor: 'action.hover',
										cursor: 'pointer'
									},
									color: item.color || 'text.primary'
								}}
							>
								<Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
									{item.icon}
								</Box>

								<ListItemText
									primary={
										<Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
											{item.name}
										</Typography>
									}
									secondary={item.description}
									sx={{ mr: 2 }}
								/>
							</ListItem>

							{index < menuItems.length - 1 && (
								<Divider sx={{ mx: 2 }} />
							)}
						</React.Fragment>
					))}
				</List>
			</Paper>
		</Box>
	);
}
