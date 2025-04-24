import React, { lazy, Suspense, useEffect, useState } from 'react';
import {
	Box,
	Typography,
	Paper,
	List,
	ListItem,
	ListItemText,
	Divider,
	CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Убедитесь, что путь к firebase правильный

const ProfileSection = lazy(() => import('./profile-section'));
const Description = lazy(() => import('@mui/icons-material/Description'));
const SettingsIcon = lazy(() => import('@mui/icons-material/Settings'));
const HelpOutline = lazy(() => import('@mui/icons-material/HelpOutline'));
const AccountCircle = lazy(() => import('@mui/icons-material/AccountCircle'));
const CreditCard = lazy(() => import('@mui/icons-material/CreditCard'));

export default function More({ user, onLogout }) {
	const navigate = useNavigate();
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUserData = async () => {
			if (user?.uid) {
				try {
					const docRef = doc(db, 'users', user.uid);
					const docSnap = await getDoc(docRef);

					if (docSnap.exists()) {
						setUserData(docSnap.data());
					}
				} catch (error) {
					console.error("Error fetching user data:", error);
				} finally {
					setLoading(false);
				}
			} else {
				setLoading(false);
			}
		};

		fetchUserData();
	}, [user]);

	const menuItems = [
		{
			name: "Предъявить студенческий",
			icon: <CreditCard color="primary" />,
			onClick: () => navigate('/idcard')
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
			icon: <SettingsIcon color="primary" />,
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
			<Suspense fallback={<div />}>
				<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
					<AccountCircle color="primary" sx={{ mr: 1 }} />
					<Typography variant="h6" sx={{ fontWeight: 600 }}>Профиль</Typography>
				</Box>
			</Suspense>

			<Paper elevation={0} sx={{
				borderRadius: 3,
				border: '1px solid',
				overflow: 'hidden',
				borderColor: 'divider',
				mb: 3
			}}>
				<List disablePadding>
					<Suspense>
						{loading ? (
							<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
								<CircularProgress size={48} />
							</Box>
						) : (
							<ProfileSection
								user={{
									...user,           // Данные из Firebase Auth
									userData: userData // Данные из Firestore
								}}
								onClick={() => navigate('/profile')}
							/>
						)}
					</Suspense>
				</List>
			</Paper>

			<Suspense fallback={<div />}>
				<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
					<SettingsIcon color="primary" sx={{ mr: 1 }} />
					<Typography variant="h6" sx={{ fontWeight: 600 }}>Меню</Typography>
				</Box>
			</Suspense>

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
								<Suspense fallback={<div style={{ width: 24, height: 24 }} />}>
									<Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
										{item.icon}
									</Box>
								</Suspense>

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
