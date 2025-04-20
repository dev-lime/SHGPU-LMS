import { useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../firebase';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Tabs,
    Tab,
    Alert,
    Divider
} from '@mui/material';
import { Email, Lock, PersonAdd, Login } from '@mui/icons-material';

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (activeTab === 0) {
                // Вход
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                // Регистрация
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            setError(getErrorMessage(err.code));
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
            p: 2,
            bgcolor: 'background.default'
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

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        InputProps={{
                            startAdornment: <Email sx={{ color: 'action.active', mr: 1 }} />
                        }}
                        required
                    />

                    <TextField
                        fullWidth
                        label="Пароль"
                        type="password"
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        InputProps={{
                            startAdornment: <Lock sx={{ color: 'action.active', mr: 1 }} />
                        }}
                        required
                    />

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
                        disabled={loading}
                        startIcon={loading ? null : (activeTab === 0 ? <Login /> : <PersonAdd />)}
                    >
                        {loading ? (
                            'Загрузка...'
                        ) : activeTab === 0 ? (
                            'Войти'
                        ) : (
                            'Зарегистрироваться'
                        )}
                    </Button>
                </form>

                <Divider sx={{ my: 3 }} />

                <Typography variant="body2" color="text.secondary" align="center">
                    {activeTab === 0 ? (
                        'Нет аккаунта? Переключитесь на регистрацию'
                    ) : (
                        'Уже есть аккаунт? Переключитесь на вход'
                    )}
                </Typography>
            </Paper>
        </Box>
    );
}
