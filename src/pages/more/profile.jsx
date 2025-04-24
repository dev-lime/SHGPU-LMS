import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
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
	Telegram,
	Person,
	SupervisorAccount,
	SupportAgent,
	AdminPanelSettings,
	ExitToApp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile, signOut } from 'firebase/auth';
import { auth, db, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Lazy-loaded components
const Dialog = lazy(() => import('@mui/material/Dialog'));
const DialogTitle = lazy(() => import('@mui/material/DialogTitle'));
const DialogContent = lazy(() => import('@mui/material/DialogContent'));
const Select = lazy(() => import('@mui/material/Select'));
const MenuItem = lazy(() => import('@mui/material/MenuItem'));
const InputLabel = lazy(() => import('@mui/material/InputLabel'));
const CloseIcon = lazy(() => import('@mui/icons-material/Close'));

const accountTypes = [
	{ value: 'student', label: 'Студент', icon: <School color="primary" /> },
	{ value: 'teacher', label: 'Преподаватель', icon: <SupervisorAccount color="primary" /> },
	{ value: 'admin', label: 'Администратор', icon: <AdminPanelSettings color="primary" /> },
	{ value: 'support', label: 'Техподдержка', icon: <SupportAgent color="primary" /> }
];

const Profile = () => {
	const navigate = useNavigate();
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [editMode, setEditMode] = useState(false);
	const [formData, setFormData] = useState({
		fullName: '',
		phone: '',
		studentGroup: '',
		accountType: 'student',
		telegramUrl: '',
		avatarUrl: ''
	});
	const [uploading, setUploading] = useState(false);
	const [openAvatarDialog, setOpenAvatarDialog] = useState(false);
	const [telegramError, setTelegramError] = useState('');
	const [error, setError] = useState(null);

	const fetchUserData = useCallback(async () => {
		try {
			if (auth.currentUser) {
				const docRef = doc(db, 'users', auth.currentUser.uid);
				const docSnap = await getDoc(docRef);

				if (docSnap.exists()) {
					const data = docSnap.data();
					setUserData(data);
					setFormData({
						fullName: data.fullName || '',
						phone: data.phone || '',
						studentGroup: data.studentGroup || '',
						accountType: data.accountType || 'student',
						telegramUrl: data.telegramUrl || '',
						avatarUrl: data.avatarUrl || auth.currentUser.photoURL || ''
					});
				}
			}
		} catch (err) {
			console.error("Ошибка загрузки данных:", err);
			setError("Не удалось загрузить данные профиля");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchUserData();
	}, [fetchUserData]);

	const validateTelegramUrl = useCallback((url) => {
		if (!url) return true;
		const telegramRegex = /^(https?:\/\/)?(t\.me\/|@)[a-zA-Z0-9_]{5,32}$/;
		return telegramRegex.test(url);
	}, []);

	const handleTelegramChange = useCallback((e) => {
		const url = e.target.value;
		setFormData(prev => ({ ...prev, telegramUrl: url }));
		setTelegramError(validateTelegramUrl(url) ? '' : 'Введите корректную ссылку Telegram (например: @username или t.me/username)');
	}, [validateTelegramUrl]);

	const handleInputChange = useCallback((field) => (e) => {
		setFormData(prev => ({ ...prev, [field]: e.target.value }));
	}, []);

	const handleFileUpload = useCallback(async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		setUploading(true);
		try {
			const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
			await uploadBytes(storageRef, file);
			const url = await getDownloadURL(storageRef);
			setFormData(prev => ({ ...prev, avatarUrl: url }));
			setOpenAvatarDialog(false);
		} catch (err) {
			console.error("Ошибка загрузки аватара:", err);
			setError("Не удалось загрузить аватар");
		} finally {
			setUploading(false);
		}
	}, []);

	const handleSaveChanges = useCallback(async () => {
		if (telegramError) return;

		setLoading(true);
		try {
			let formattedTelegramUrl = formData.telegramUrl;
			if (formData.telegramUrl && !formData.telegramUrl.startsWith('https://t.me/')) {
				formattedTelegramUrl = `https://t.me/${formData.telegramUrl.replace(/^@/, '')}`;
			}

			const updatedData = {
				...formData,
				telegramUrl: formattedTelegramUrl,
				updatedAt: new Date()
			};

			await updateDoc(doc(db, 'users', auth.currentUser.uid), updatedData);

			await updateProfile(auth.currentUser, {
				displayName: formData.fullName,
				photoURL: formData.avatarUrl
			});

			setUserData(prev => ({
				...prev,
				...updatedData
			}));

			setEditMode(false);
		} catch (err) {
			console.error("Ошибка сохранения:", err);
			setError("Не удалось сохранить изменения");
		} finally {
			setLoading(false);
		}
	}, [formData, telegramError]);

	const handleLogout = useCallback(async () => {
		try {
			await signOut(auth);
			navigate('/');
		} catch (err) {
			console.error("Ошибка выхода:", err);
			setError("Не удалось выйти из аккаунта");
		}
	}, [navigate]);

	const getAccountTypeIcon = useCallback((type) =>
		accountTypes.find(t => t.value === type)?.icon || <Person color="primary" />,
		[]);

	const getAccountTypeLabel = useCallback((type) =>
		accountTypes.find(t => t.value === type)?.label || 'Пользователь',
		[]);

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
							src={formData.avatarUrl}
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
							{formData.fullName.charAt(0) || 'U'}
						</Avatar>
						<Typography variant="body2" color="text.secondary">
							Нажмите на аватар для изменения
						</Typography>
					</Box>

					<TextField
						fullWidth
						label="ФИО"
						margin="normal"
						value={formData.fullName}
						onChange={handleInputChange('fullName')}
						required
					/>

					<TextField
						fullWidth
						label="Телефон"
						margin="normal"
						value={formData.phone}
						onChange={handleInputChange('phone')}
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
						value={formData.studentGroup}
						onChange={handleInputChange('studentGroup')}
						disabled={formData.accountType !== 'student'}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<School color="primary" />
								</InputAdornment>
							),
						}}
					/>

					<Suspense fallback={<CircularProgress />}>
						<FormControl fullWidth margin="normal">
							<InputLabel>Тип аккаунта</InputLabel>
							<Select
								value={formData.accountType}
								label="Тип аккаунта"
								onChange={handleInputChange('accountType')}
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
					</Suspense>

					<TextField
						fullWidth
						label="Telegram"
						margin="normal"
						value={formData.telegramUrl}
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
			<Suspense fallback={null}>
				{openAvatarDialog && (
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
								<CloseIcon />
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
				)}
			</Suspense>
		</Box>
	);
};

export default Profile;
