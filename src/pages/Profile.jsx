import React, { useState, useEffect } from 'react';
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
	Button,
	TextField,
	CircularProgress,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Select,
	MenuItem,
	InputLabel,
	FormControl,
	FormHelperText,
	InputAdornment
} from '@mui/material';
import {
	ArrowBack,
	Phone,
	Email,
	School,
	Edit,
	Close,
	Telegram,
	Person,
	SupervisorAccount,
	SupportAgent,
	School as TeacherIcon,
	ExitToApp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile, signOut } from 'firebase/auth';
import { auth, db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const accountTypes = [
	{ value: 'student', label: 'Студент', icon: <School color="primary" /> },
	{ value: 'teacher', label: 'Преподаватель', icon: <TeacherIcon color="primary" /> },
	{ value: 'admin', label: 'Администратор', icon: <SupervisorAccount color="primary" /> },
	{ value: 'support', label: 'Техподдержка', icon: <SupportAgent color="primary" /> }
];

export default function Profile() {
	const navigate = useNavigate();
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [editMode, setEditMode] = useState(false);
	const [fullName, setFullName] = useState('');
	const [phone, setPhone] = useState('');
	const [studentGroup, setStudentGroup] = useState('');
	const [accountType, setAccountType] = useState('student');
	const [telegramUrl, setTelegramUrl] = useState('');
	const [avatarUrl, setAvatarUrl] = useState('');
	const [uploading, setUploading] = useState(false);
	const [openAvatarDialog, setOpenAvatarDialog] = useState(false);
	const [telegramError, setTelegramError] = useState('');
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				if (auth.currentUser) {
					const docRef = doc(db, 'users', auth.currentUser.uid);
					const docSnap = await getDoc(docRef);

					if (docSnap.exists()) {
						const data = docSnap.data();
						setUserData(data);
						setFullName(data.fullName || '');
						setPhone(data.phone || '');
						setStudentGroup(data.studentGroup || '');
						setAccountType(data.accountType || 'student');
						setTelegramUrl(data.telegramUrl || '');
						setAvatarUrl(data.avatarUrl || auth.currentUser.photoURL || '');
					}
				}
			} catch (err) {
				console.error("Ошибка загрузки данных:", err);
				setError("Не удалось загрузить данные профиля");
			} finally {
				setLoading(false);
			}
		};

		fetchUserData();
	}, []);

	const validateTelegramUrl = (url) => {
		if (!url) return true;
		const telegramRegex = /^(https?:\/\/)?(t\.me\/|@)[a-zA-Z0-9_]{5,32}$/;
		return telegramRegex.test(url);
	};

	const handleTelegramChange = (e) => {
		const url = e.target.value;
		setTelegramUrl(url);
		setTelegramError(validateTelegramUrl(url) ? '' : 'Введите корректную ссылку Telegram (например: @username или t.me/username)');
	};

	const handleFileUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		setUploading(true);
		try {
			const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
			await uploadBytes(storageRef, file);
			const url = await getDownloadURL(storageRef);
			setAvatarUrl(url);
			setOpenAvatarDialog(false);
		} catch (err) {
			console.error("Ошибка загрузки аватара:", err);
			setError("Не удалось загрузить аватар");
		} finally {
			setUploading(false);
		}
	};

	const handleSaveChanges = async () => {
		if (telegramError) return;

		setLoading(true);
		try {
			let formattedTelegramUrl = telegramUrl;
			if (telegramUrl && !telegramUrl.startsWith('https://t.me/')) {
				formattedTelegramUrl = `https://t.me/${telegramUrl.replace(/^@/, '')}`;
			}

			await updateDoc(doc(db, 'users', auth.currentUser.uid), {
				fullName,
				phone,
				studentGroup,
				accountType,
				telegramUrl: formattedTelegramUrl,
				avatarUrl,
				updatedAt: new Date()
			});

			await updateProfile(auth.currentUser, {
				displayName: fullName,
				photoURL: avatarUrl
			});

			setUserData(prev => ({
				...prev,
				fullName,
				phone,
				studentGroup,
				accountType,
				telegramUrl: formattedTelegramUrl,
				avatarUrl
			}));

			setEditMode(false);
		} catch (err) {
			console.error("Ошибка сохранения:", err);
			setError("Не удалось сохранить изменения");
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		try {
			await signOut(auth);
			navigate('/');
		} catch (err) {
			console.error("Ошибка выхода:", err);
			setError("Не удалось выйти из аккаунта");
		}
	};

	const getAccountTypeIcon = (type) => accountTypes.find(t => t.value === type)?.icon || <Person color="primary" />;
	const getAccountTypeLabel = (type) => accountTypes.find(t => t.value === type)?.label || 'Пользователь';

	if (loading && !editMode) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 3, textAlign: 'center' }}>
				<Typography color="error">{error}</Typography>
				<Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>
					Обновить страницу
				</Button>
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
					<ArrowBack color="primary" />
				</IconButton>
				<Typography variant="h6" sx={{ fontWeight: 600 }}>
					{editMode ? 'Редактирование профиля' : 'Профиль'}
				</Typography>

				{!editMode && (
					<Button
						startIcon={<Edit color="primary" />}
						sx={{
							ml: 'auto',
							color: 'primary.main',
							'&.Mui-selected': { outline: 'none' },
							'&:focus': { outline: 'none' }
						}}
						onClick={() => setEditMode(true)}
					>
						Редактировать
					</Button>
				)}
			</Box>

			{editMode ? (
				<>
					<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
						<Avatar
							src={avatarUrl}
							sx={{
								width: 120,
								height: 120,
								mb: 2,
								fontSize: 48,
								cursor: 'pointer',
								bgcolor: 'primary.main'
							}}
							onClick={() => setOpenAvatarDialog(true)}
						>
							{fullName.charAt(0) || 'U'}
						</Avatar>
						<Typography variant="body2" color="text.secondary">
							Нажмите на аватар для изменения
						</Typography>
					</Box>

					<TextField
						fullWidth
						label="ФИО"
						margin="normal"
						value={fullName}
						onChange={(e) => setFullName(e.target.value)}
						required
					/>

					<TextField
						fullWidth
						label="Телефон"
						margin="normal"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Phone color="primary" />
								</InputAdornment>
							),
						}}
					/>

					<TextField
						fullWidth
						label="Группа (если студент)"
						margin="normal"
						value={studentGroup}
						onChange={(e) => setStudentGroup(e.target.value)}
						disabled={accountType !== 'student'}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<School color="primary" />
								</InputAdornment>
							),
						}}
					/>

					<FormControl fullWidth margin="normal">
						<InputLabel>Тип аккаунта</InputLabel>
						<Select
							value={accountType}
							label="Тип аккаунта"
							onChange={(e) => setAccountType(e.target.value)}
						>
							{accountTypes.map((type) => (
								<MenuItem key={type.value} value={type.value}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										{type.icon}
										{type.label}
									</Box>
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<TextField
						fullWidth
						label="Telegram"
						margin="normal"
						value={telegramUrl}
						onChange={handleTelegramChange}
						error={!!telegramError}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Telegram color="primary" />
								</InputAdornment>
							),
						}}
						placeholder="@username или t.me/username"
					/>
					{telegramError && <FormHelperText error>{telegramError}</FormHelperText>}

					<Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
						<Button
							fullWidth
							variant="outlined"
							onClick={() => setEditMode(false)}
							disabled={loading}
							sx={{
								'&.Mui-selected': { outline: 'none' },
								'&:focus': { outline: 'none' }
							}}
						>
							Отмена
						</Button>
						<Button
							fullWidth
							variant="contained"
							onClick={handleSaveChanges}
							disabled={loading}
							sx={{
								'&.Mui-selected': { outline: 'none' },
								'&:focus': { outline: 'none' }
							}}
						>
							{loading ? <CircularProgress size={24} /> : 'Сохранить'}
						</Button>
					</Box>
				</>
			) : (
				<>
					<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
						<Avatar
							src={userData?.avatarUrl || auth.currentUser?.photoURL}
							sx={{
								width: 120,
								height: 120,
								mb: 2,
								fontSize: 48,
								bgcolor: 'primary.main'
							}}
						>
							{auth.currentUser?.displayName?.charAt(0) || 'U'}
						</Avatar>
						<Typography variant="h5" sx={{ fontWeight: 600 }}>
							{userData?.fullName || auth.currentUser?.displayName || 'Пользователь'}
						</Typography>
						<Typography variant="subtitle1" color="primary" sx={{ mt: 1 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								{getAccountTypeIcon(userData?.accountType)}
								{getAccountTypeLabel(userData?.accountType)}
							</Box>
						</Typography>
					</Box>

					<Paper elevation={0} sx={{
						borderRadius: 3,
						border: '1px solid',
						borderColor: 'divider',
						mb: 2
					}}>
						<List>
							<ListItem>
								<ListItemAvatar>
									<Avatar sx={{ bgcolor: 'primary.main' }}>
										<Email sx={{ color: 'primary.contrastText' }} />
									</Avatar>
								</ListItemAvatar>
								<ListItemText
									primary="Email"
									secondary={auth.currentUser?.email}
								/>
							</ListItem>
							<Divider variant="inset" component="li" />

							<ListItem>
								<ListItemAvatar>
									<Avatar sx={{ bgcolor: 'primary.main' }}>
										<Phone sx={{ color: 'primary.contrastText' }} />
									</Avatar>
								</ListItemAvatar>
								<ListItemText
									primary="Телефон"
									secondary={userData?.phone || 'Не указан'}
								/>
							</ListItem>
							<Divider variant="inset" component="li" />

							{userData?.accountType === 'student' && (
								<>
									<ListItem>
										<ListItemAvatar>
											<Avatar sx={{ bgcolor: 'primary.main' }}>
												<School sx={{ color: 'primary.contrastText' }} />
											</Avatar>
										</ListItemAvatar>
										<ListItemText
											primary="Группа"
											secondary={userData?.studentGroup || 'Не указана'}
										/>
									</ListItem>
									<Divider variant="inset" component="li" />
								</>
							)}

							<ListItem>
								<ListItemAvatar>
									<Avatar sx={{ bgcolor: 'primary.main' }}>
										<Telegram sx={{ color: 'primary.contrastText' }} />
									</Avatar>
								</ListItemAvatar>
								<ListItemText
									primary="Telegram"
									secondary={
										userData?.telegramUrl ? (
											<a
												href={userData.telegramUrl}
												target="_blank"
												rel="noopener noreferrer"
												style={{ color: 'inherit' }}
											>
												{userData.telegramUrl.replace('https://t.me/', '@')}
											</a>
										) : 'Не указан'
									}
								/>
							</ListItem>
						</List>
					</Paper>

					<Button
						variant="contained"
						color="error"
						startIcon={<ExitToApp />}
						onClick={handleLogout}
						sx={{
							mt: 'auto',
							'&.Mui-selected': { outline: 'none' },
							'&:focus': { outline: 'none' }
						}}
					>
						Выйти из аккаунта
					</Button>
				</>
			)}

			{/* Диалог для загрузки аватара */}
			<Dialog open={openAvatarDialog} onClose={() => setOpenAvatarDialog(false)}>
				<DialogTitle>
					Изменить аватар
					<IconButton
						aria-label="close"
						onClick={() => setOpenAvatarDialog(false)}
						sx={{
							position: 'absolute',
							right: 8,
							top: 8,
							color: (theme) => theme.palette.grey[500],
						}}
					>
						<Close />
					</IconButton>
				</DialogTitle>
				<DialogContent sx={{ p: 3, textAlign: 'center' }}>
					<input
						accept="image/*"
						style={{ display: 'none' }}
						id="avatar-upload"
						type="file"
						onChange={handleFileUpload}
					/>
					<label htmlFor="avatar-upload">
						<Button
							variant="contained"
							component="span"
							disabled={uploading}
						>
							{uploading ? 'Загрузка...' : 'Выбрать изображение'}
						</Button>
					</label>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
