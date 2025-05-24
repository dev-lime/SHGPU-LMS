import React from 'react';
import {
	Box,
	Typography,
	Paper,
	List,
	Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
	Description,
	FormatListBulleted,
	Settings,
	HelpOutline,
	AccountCircle,
	Badge,
	Payment
} from '@mui/icons-material';
import ProfileSection from './ProfileSection';
import CustomListItem from '@components/CustomListItem';

export default function More() {
	const navigate = useNavigate();

	const menuItems = [
		{
			name: "Предъявить студенческий",
			icon: <Badge color="primary" />,
			onClick: () => navigate('/idcard')
		},
		{
			name: "Онлайн-платежи",
			description: "Оплата обучения и других услуг",
			icon: <Payment color="primary" />,
			onClick: () => window.open('https://pay.shspu.ru/', '_blank')
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
			{/* Секция профиля */}
			<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
				<AccountCircle color="primary" sx={{ mr: 1 }} />
				<Typography variant="h6" sx={{ fontWeight: 600 }}>Профиль</Typography>
			</Box>

			<Paper elevation={0} sx={{
				borderRadius: 3,
				border: '1px solid',
				borderColor: 'divider',
				mb: 3
			}}>
				<List disablePadding>
					<ProfileSection />
				</List>
			</Paper>

			{/* Секция меню */}
			<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
				<FormatListBulleted color="primary" sx={{ mr: 1 }} />
				<Typography variant="h6" sx={{ fontWeight: 600 }}>Меню</Typography>
			</Box>

			<Paper elevation={0} sx={{
				borderRadius: 3,
				border: '1px solid',
				borderColor: 'divider'
			}}>
				<List disablePadding>
					{menuItems.map((item, index) => (
						<React.Fragment key={index}>
							<CustomListItem
								name={item.name}
								description={item.description}
								icon={item.icon}
								onClick={item.onClick}
							/>
							{index < menuItems.length - 1 && <Divider sx={{ mx: 2 }} />}
						</React.Fragment>
					))}
				</List>
			</Paper>
		</Box>
	);
}
