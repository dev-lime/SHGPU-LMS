import React, { useEffect, useState } from 'react';
import {
	Box,
	Typography,
    Paper,
	IconButton,
	Avatar,
	List,
	ListItem,
	ListItemText,
	ListItemAvatar,
	Divider,
	Button
} from '@mui/material';
import {
	ArrowBack,
	Phone,
	Email,
	School,
	Edit
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function Profile() {
	const navigate = useNavigate();
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUserData = async () => {
			if (auth.currentUser) {
				const docRef = doc(db, 'users', auth.currentUser.uid);
				const docSnap = await getDoc(docRef);

				if (docSnap.exists()) {
					setUserData(docSnap.data());
				}
				setLoading(false);
			}
		};

		fetchUserData();
	}, []);

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
				<Typography>Загрузка...</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{
			padding: { xs: 2, sm: 3 },
			display: 'flex',
			flexDirection: 'column',
			height: '100%'
		}}>
			<Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
				<IconButton
					onClick={() => navigate(-1)}
					sx={{
						mr: 1,
						'&.Mui-selected': { outline: 'none' },
						'&:focus': { outline: 'none' }
					}}
				>
					<ArrowBack />
				</IconButton>
				<Typography variant="h6" sx={{ fontWeight: 600 }}>Профиль</Typography>
			</Box>

			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
				<Avatar
					src={userData?.avatarUrl || auth.currentUser?.photoURL}
					sx={{
						width: 120,
						height: 120,
						mb: 2,
						fontSize: 48
					}}
				>
					{auth.currentUser?.displayName?.charAt(0) || 'U'}
				</Avatar>
				<Typography variant="h5" sx={{ fontWeight: 600 }}>
					{userData?.fullName || auth.currentUser?.displayName || 'Пользователь'}
				</Typography>
			</Box>

			<Paper elevation={0} sx={{
				borderRadius: 3,
				border: '1px solid',
				borderColor: 'divider',
				color: 'primary'
			}}>
				<List>
					<ListItem>
						<ListItemAvatar>
							<Avatar>
								<Email />
							</Avatar>
						</ListItemAvatar>
						<ListItemText
							primary="Email"
							secondary={auth.currentUser?.email}
						/>
					</ListItem>

					<ListItem>
						<ListItemAvatar>
							<Avatar>
								<Phone />
							</Avatar>
						</ListItemAvatar>
						<ListItemText
							primary="Телефон"
							secondary={userData?.phone || 'Не указан'}
						/>
					</ListItem>

					<ListItem>
						<ListItemAvatar>
							<Avatar>
								<School />
							</Avatar>
						</ListItemAvatar>
						<ListItemText
							primary="Группа"
							secondary={userData?.studentGroup || 'Не указана'}
						/>
					</ListItem>
				</List>
			</Paper>

			{/*
			<Button
				variant="outlined"
				startIcon={<Edit />}
				sx={{
					mt: 3,
					alignSelf: 'center',
					'&.Mui-selected': {
						outline: 'none'
					},
					'&:focus': {
						outline: 'none'
					}
				}}
				onClick={() => navigate('/edit-profile')}
			>
				Редактировать профиль
			</Button>
			*/}
		</Box>
	);
}
