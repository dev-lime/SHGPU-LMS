import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, IconButton, Avatar, List, ListItem, ListItemText, ListItemAvatar, Divider, Button, TextField, CircularProgress, FormControl, FormHelperText, Dialog, DialogTitle, DialogContent, Select, MenuItem, InputLabel } from '@mui/material';
import { ArrowBack, Phone, Email, School, Edit, Telegram, Person, SupervisorAccount, SupportAgent, AdminPanelSettings, ExitToApp, Close as CloseIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auth, storage } from '@src/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getPhoneError, getGroupError, normalizeGroupName } from '@utils/validators';
import useProfile from '@hooks/useProfile';

const Profile = () => {
	const navigate = useNavigate();
	const {
		userData,
		loading,
		error,
		updateUserData,
		handleLogout,
		getAccountTypeIcon,
		getAccountTypeLabel,
		ACCOUNT_TYPES
	} = useProfile();

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
	const [phoneError, setPhoneError] = useState('');
	const [groupError, setGroupError] = useState('');

	// Инициализация formData при загрузке userData
	useEffect(() => {
		if (userData) {
			setFormData({
				fullName: userData.fullName || '',
				phone: userData.phone || '',
				studentGroup: userData.studentGroup || '',
				accountType: userData.accountType || 'student',
				telegramUrl: userData.telegramUrl || '',
				avatarUrl: userData.avatarUrl || ''
			});
		}
	}, [userData]);

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

	const handlePhoneChange = useCallback((e) => {
		const value = e.target.value;
		setFormData(prev => ({ ...prev, phone: value }));
		setPhoneError(getPhoneError(value));
	}, []);

	const handleGroupChange = useCallback((e) => {
		const value = e.target.value;
		setFormData(prev => ({ ...prev, studentGroup: value }));
		setGroupError(getGroupError(value));
	}, []);

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
		} finally {
			setUploading(false);
		}
	}, []);

	const handleSaveChanges = useCallback(async () => {
		if (telegramError || phoneError || groupError) return;

		try {
			let formattedTelegramUrl = formData.telegramUrl;
			if (formData.telegramUrl && !formData.telegramUrl.startsWith('https://t.me/')) {
				formattedTelegramUrl = `https://t.me/${formData.telegramUrl.replace(/^@/, '')}`;
			}

			const updatedData = {
				fullName: formData.fullName,
				phone: formData.phone,
				studentGroup: formData.accountType === 'student' ? normalizeGroupName(formData.studentGroup) : '',
				accountType: formData.accountType,
				telegramUrl: formattedTelegramUrl,
				avatarUrl: formData.avatarUrl
			};

			await updateUserData(updatedData);
			setEditMode(false);
		} catch (err) {
			console.error("Ошибка сохранения:", err);
		}
	}, [formData, telegramError, phoneError, groupError, updateUserData]);

	const handleLogoutClick = useCallback(async () => {
		try {
			await handleLogout();
			navigate('/');
		} catch (err) {
			console.error("Ошибка выхода:", err);
		}
	}, [handleLogout, navigate]);

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

	if (!userData) {
		return (
			<Box sx={{ p: 3, textAlign: 'center' }}>
				<Typography>Пользователь не авторизован</Typography>
				<Button onClick={() => navigate('/login')} sx={{ mt: 2 }}>
					Войти
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
			{/* Заголовок и кнопка назад */}
			<Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
				<IconButton
					onClick={() => navigate(-1)}
					sx={{ mr: 1 }}
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
							'&.Mui-selected, &:focus': { outline: 'none' }
						}}
						onClick={() => setEditMode(true)}
					>
						Редактировать
					</Button>
				)}
			</Box>

			{editMode ? (
				// Режим редактирования
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
						onChange={handlePhoneChange}
						error={!!phoneError}
						InputProps={{
							startAdornment: <Phone color="primary" />
						}}
					/>
					{phoneError && <FormHelperText error>{phoneError}</FormHelperText>}

					<TextField
						fullWidth
						label="Группа (если студент)"
						margin="normal"
						value={formData.studentGroup}
						onChange={handleGroupChange}
						error={!!groupError}
						disabled={formData.accountType !== 'student'}
						InputProps={{
							startAdornment: <School color="primary" />
						}}
						helperText={groupError || 'Пример: 230б, 133б-а, 2-11б'}
					/>

					<FormControl fullWidth margin="normal">
						<InputLabel>Тип аккаунта</InputLabel>
						<Select
							value={formData.accountType}
							label="Тип аккаунта"
							onChange={handleInputChange('accountType')}
						>
							{Object.values(ACCOUNT_TYPES).map((type) => (
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
						value={formData.telegramUrl}
						onChange={handleTelegramChange}
						error={!!telegramError}
						InputProps={{
							startAdornment: <Telegram color="primary" />
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
						>
							Отмена
						</Button>
						<Button
							fullWidth
							variant="contained"
							onClick={handleSaveChanges}
							disabled={loading || !!telegramError || !!phoneError || !!groupError}
						>
							{loading ? <CircularProgress size={24} /> : 'Сохранить'}
						</Button>
					</Box>
				</>
			) : (
				// Режим просмотра
				<>
					<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
						<Avatar
							src={userData.avatarUrl}
							sx={{
								width: 120,
								height: 120,
								mb: 2,
								fontSize: 48,
								bgcolor: 'primary.main'
							}}
						>
							{userData.fullName?.charAt(0) || 'U'}
						</Avatar>
						<Typography variant="h5" sx={{ fontWeight: 600 }}>
							{userData.fullName || 'Пользователь'}
						</Typography>
						<Typography variant="subtitle1" color="primary" sx={{ mt: 1 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								{getAccountTypeIcon(userData.accountType)}
								{getAccountTypeLabel(userData.accountType)}
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
									secondary={userData.email}
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
									secondary={userData.phone || 'Не указан'}
								/>
							</ListItem>
							<Divider variant="inset" component="li" />

							{userData.accountType === 'student' && (
								<>
									<ListItem>
										<ListItemAvatar>
											<Avatar sx={{ bgcolor: 'primary.main' }}>
												<School sx={{ color: 'primary.contrastText' }} />
											</Avatar>
										</ListItemAvatar>
										<ListItemText
											primary="Группа"
											secondary={userData.studentGroup || 'Не указана'}
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
										userData.telegramUrl ? (
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
						onClick={handleLogoutClick}
						sx={{
							mt: 'auto',
							'&.Mui-selected, &:focus': { outline: 'none' }
						}}
					>
						Выйти из аккаунта
					</Button>
				</>
			)}

			{/* Диалог изменения аватара */}
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
		</Box>
	);
};

export default Profile;
