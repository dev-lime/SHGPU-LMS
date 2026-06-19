import { useState } from 'react';
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@src/firebase';
import { getGroupId } from '@services/groupService';
import {
	validatePhone,
	getPhoneError,
	validateGroup,
	getGroupError,
	validateEmail,
	getPasswordError,
	getUserNameError
} from '@utils/validators';
import useField from '@hooks/useField';
import usePasswordStrength from '@hooks/usePasswordStrength';
import {
	Box,
	TextField,
	Button,
	Typography,
	Paper,
	Tabs,
	Tab,
	Alert,
	Divider,
	FormHelperText,
	LinearProgress
} from '@mui/material';
import {
	Email,
	Lock,
	PersonAdd,
	Login,
	Phone,
	School,
	Person
} from '@mui/icons-material';

export default function Auth() {
	const [activeTab, setActiveTab] = useState(0);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const nameField = useField('', getUserNameError);
	const phoneField = useField('', getPhoneError);
	const groupField = useField('', getGroupError);
	const emailField = useField('', (v) => validateEmail(v) ? null : 'Введите корректный email');
	const passwordField = useField('', getPasswordError);

	const { strength, strengthText } = usePasswordStrength(passwordField.value);

	const validateForm = () => {
		if (activeTab === 0) {
			return !emailField.error && !passwordField.error && emailField.value && passwordField.value;
		} else {
			const basicValid = !nameField.error && !emailField.error && !passwordField.error
				&& nameField.value && emailField.value && passwordField.value;
			const optionalValid = (!phoneField.value || !phoneField.error)
				&& (!groupField.value || !groupField.error);
			return basicValid && optionalValid;
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			if (activeTab === 0) {
				await signInWithEmailAndPassword(auth, emailField.value, passwordField.value);
			} else {
				if (phoneField.value && !validatePhone(phoneField.value)) {
					throw new Error('invalid-phone');
				}
				if (groupField.value && !validateGroup(groupField.value)) {
					throw new Error('invalid-group');
				}

				const userCredential = await createUserWithEmailAndPassword(auth, emailField.value, passwordField.value);
				await updateProfile(userCredential.user, {
					displayName: nameField.value
				});

				const normalizedGroup = groupField.value ? groupField.value.toUpperCase() : '';
				const groupId = normalizedGroup ? await getGroupId(normalizedGroup) : null;

				await setDoc(doc(db, 'users', userCredential.user.uid), {
					fullName: nameField.value,
					email: emailField.value,
					phone: phoneField.value,
					studentGroup: normalizedGroup,
					groupId,
					createdAt: new Date(),
					updatedAt: new Date()
				});
			}
		} catch (err) {
			setError(getErrorMessage(err.code || err.message));
		} finally {
			setLoading(false);
		}
	};

	const getErrorMessage = (code) => {
		switch (code) {
			case 'auth/email-already-in-use':
				return 'Email уже используется';
			case 'auth/invalid-email':
				return 'Неверный формат email';
			case 'auth/weak-password':
				return 'Пароль должен содержать минимум 6 символов';
			case 'auth/user-not-found':
				return 'Пользователь не найден';
			case 'auth/wrong-password':
				return 'Неверный пароль';
			case 'invalid-phone':
				return 'Неверный формат телефона';
			case 'invalid-group':
				return 'Неверный формат группы';
			default:
				return 'Ошибка аутентификации';
		}
	};

	return (
		<Box sx={{
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			minHeight: '100vh',
			p: 2
		}}>
			<Paper elevation={3} sx={{
				width: '100%',
				maxWidth: 400,
				p: 3,
				borderRadius: 3
			}}>
				<Tabs
					value={activeTab}
					onChange={(e, newValue) => {
						setActiveTab(newValue);
						setError('');
					}}
					variant="fullWidth"
					sx={{ mb: 3 }}
				>
					<Tab label="Вход" icon={<Login />} iconPosition="start" />
					<Tab label="Регистрация" icon={<PersonAdd />} iconPosition="start" />
				</Tabs>

				{error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

				<form onSubmit={handleSubmit}>
					{activeTab === 1 && (
						<>
							<TextField
								fullWidth
								label="ФИО"
								margin="normal"
								value={nameField.value}
								onChange={nameField.onChange}
								error={!!nameField.error}
								helperText={nameField.error}
								InputProps={{ startAdornment: <Person sx={{ color: 'action.active', mr: 1 }} /> }}
								required
							/>

							<TextField
								fullWidth
								label="Телефон"
								margin="normal"
								value={phoneField.value}
								onChange={phoneField.onChange}
								error={!!phoneField.error}
								InputProps={{ startAdornment: <Phone sx={{ color: 'action.active', mr: 1 }} /> }}
								placeholder="+7 или 8"
							/>
							{phoneField.error && <FormHelperText error>{phoneField.error}</FormHelperText>}

							<TextField
								fullWidth
								label="Группа"
								margin="normal"
								value={groupField.value}
								onChange={groupField.onChange}
								error={!!groupField.error}
								InputProps={{ startAdornment: <School sx={{ color: 'action.active', mr: 1 }} /> }}
								helperText={groupField.error || 'Пример: 230б, 133б-а, 2-11б'}
							/>
						</>
					)}

					<TextField
						fullWidth
						label="Email"
						type="email"
						margin="normal"
						value={emailField.value}
						onChange={emailField.onChange}
						error={!!emailField.error}
						helperText={emailField.error}
						InputProps={{ startAdornment: <Email sx={{ color: 'action.active', mr: 1 }} /> }}
						required
					/>

					<TextField
						fullWidth
						label="Пароль"
						type="password"
						margin="normal"
						value={passwordField.value}
						onChange={passwordField.onChange}
						error={!!passwordField.error}
						helperText={passwordField.error}
						InputProps={{ startAdornment: <Lock sx={{ color: 'action.active', mr: 1 }} /> }}
						required
					/>

					{activeTab === 1 && passwordField.value && (
						<Box sx={{ mt: 1, mb: 2 }}>
							<LinearProgress
								variant="determinate"
								value={(strength / 4) * 100}
								sx={{
									height: 6,
									borderRadius: 3,
									backgroundColor: '#e0e0e0',
									'& .MuiLinearProgress-bar': {
										backgroundColor: strengthText.color
									}
								}}
							/>
							<Typography variant="caption" sx={{ color: strengthText.color }}>
								{strengthText.text}
							</Typography>
						</Box>
					)}

					<Button
						fullWidth
						type="submit"
						variant="contained"
						size="large"
						sx={{
							mt: 3, height: 48,
							'&.Mui-selected, &:focus': { outline: 'none' }
						}}
						disabled={loading || !validateForm()}
						startIcon={loading ? null : (activeTab === 0 ? <Login /> : <PersonAdd />)}
					>
						{loading ? 'Загрузка...' : activeTab === 0 ? 'Войти' : 'Зарегистрироваться'}
					</Button>
				</form>

				<Divider sx={{ my: 3 }} />
				<Typography variant="body2" color="text.secondary" align="center">
					{activeTab === 0 ? 'Нет аккаунта? Переключитесь на регистрацию' : 'Уже есть аккаунт? Переключитесь на вход'}
				</Typography>
			</Paper>
		</Box>
	);
}
