import { useState, useEffect } from 'react';
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@src/firebase';
import {
	validatePhone,
	getPhoneError,
	validateGroup,
	getGroupError,
	validateEmail,
	getPasswordError,
	validateUserName,
	getUserNameError,
	getPasswordStrength,
	getPasswordStrengthText
} from '@utils/validators';
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
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [fullName, setFullName] = useState('');
	const [phone, setPhone] = useState('');
	const [studentGroup, setStudentGroup] = useState('');
	const [error, setError] = useState('');
	const [activeTab, setActiveTab] = useState(0);
	const [loading, setLoading] = useState(false);
	const [phoneError, setPhoneError] = useState('');
	const [groupError, setGroupError] = useState('');
	const [nameError, setNameError] = useState('');
	const [emailError, setEmailError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [passwordStrength, setPasswordStrength] = useState(0);
	const [strengthText, setStrengthText] = useState('');

	useEffect(() => {
		if (password) {
			const strength = getPasswordStrength(password);
			setPasswordStrength(strength);
			setStrengthText(getPasswordStrengthText(strength));
		} else {
			setPasswordStrength(0);
			setStrengthText('');
		}
	}, [password]);

	const handlePhoneChange = (e) => {
		const value = e.target.value;
		setPhone(value);
		setPhoneError(getPhoneError(value));
	};

	const handleGroupChange = (e) => {
		const value = e.target.value;
		setStudentGroup(value);
		setGroupError(getGroupError(value));
	};

	const handleNameChange = (e) => {
		const value = e.target.value;
		setFullName(value);
		setNameError(getUserNameError(value));
	};

	const handleEmailChange = (e) => {
		const value = e.target.value;
		setEmail(value);
		setEmailError(validateEmail(value) ? '' : 'Введите корректный email');
	};

	const handlePasswordChange = (e) => {
		const value = e.target.value;
		setPassword(value);
		setPasswordError(getPasswordError(value));
	};

	const validateForm = () => {
		if (activeTab === 0) {
			return !emailError && !passwordError && email && password;
		} else {
			const basicValid = !nameError && !emailError && !passwordError && fullName && email && password;
			const optionalValid = (!phone || !phoneError) && (!studentGroup || !groupError);
			return basicValid && optionalValid;
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			if (activeTab === 0) {
				await signInWithEmailAndPassword(auth, email, password);
			} else {
				if (phone && !validatePhone(phone)) {
					throw new Error('invalid-phone');
				}
				if (studentGroup && !validateGroup(studentGroup)) {
					throw new Error('invalid-group');
				}

				const userCredential = await createUserWithEmailAndPassword(auth, email, password);
				await updateProfile(userCredential.user, {
					displayName: fullName
				});

				await setDoc(doc(db, 'users', userCredential.user.uid), {
					fullName,
					email,
					phone,
					studentGroup: studentGroup ? studentGroup.toUpperCase() : '',
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
					onChange={(e, newValue) => setActiveTab(newValue)}
					variant="fullWidth"
					sx={{ mb: 3 }}
				>
					<Tab label="Вход" icon={<Login />} iconPosition="start"
						sx={{
							'&.Mui-selected': {
								outline: 'none'
							},
							'&:focus': {
								outline: 'none'
							}
						}} />
					<Tab label="Регистрация" icon={<PersonAdd />} iconPosition="start"
						sx={{
							'&.Mui-selected': {
								outline: 'none'
							},
							'&:focus': {
								outline: 'none'
							}
						}} />
				</Tabs>

				{error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

				<form onSubmit={handleSubmit}>
					{activeTab === 1 && (
						<>
							<TextField
								fullWidth
								label="ФИО"
								margin="normal"
								value={fullName}
								onChange={handleNameChange}
								error={!!nameError}
								helperText={nameError}
								InputProps={{ startAdornment: <Person sx={{ color: 'action.active', mr: 1 }} /> }}
								required
							/>

							<TextField
								fullWidth
								label="Телефон"
								margin="normal"
								value={phone}
								onChange={handlePhoneChange}
								error={!!phoneError}
								InputProps={{ startAdornment: <Phone sx={{ color: 'action.active', mr: 1 }} /> }}
								placeholder="+7 или 8"
							/>
							{phoneError && <FormHelperText error>{phoneError}</FormHelperText>}

							<TextField
								fullWidth
								label="Группа"
								margin="normal"
								value={studentGroup}
								onChange={handleGroupChange}
								error={!!groupError}
								InputProps={{ startAdornment: <School sx={{ color: 'action.active', mr: 1 }} /> }}
								helperText={groupError || 'Пример: 230б, 133б-а, 2-11б'}
							/>
						</>
					)}

					<TextField
						fullWidth
						label="Email"
						type="email"
						margin="normal"
						value={email}
						onChange={handleEmailChange}
						error={!!emailError}
						helperText={emailError}
						InputProps={{ startAdornment: <Email sx={{ color: 'action.active', mr: 1 }} /> }}
						required
					/>

					<TextField
						fullWidth
						label="Пароль"
						type="password"
						margin="normal"
						value={password}
						onChange={handlePasswordChange}
						error={!!passwordError}
						helperText={passwordError}
						InputProps={{ startAdornment: <Lock sx={{ color: 'action.active', mr: 1 }} /> }}
						required
					/>

					{activeTab === 1 && password && (
						<Box sx={{ mt: 1, mb: 2 }}>
							<LinearProgress
								variant="determinate"
								value={(passwordStrength / 4) * 100}
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
							'&.Mui-selected': {
								outline: 'none'
							},
							'&:focus': {
								outline: 'none'
							}
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
