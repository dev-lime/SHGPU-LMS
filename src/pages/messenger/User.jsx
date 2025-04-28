import React, { useState, useEffect } from 'react';
import {
    Typography,
    Avatar,
    Box,
    IconButton,
    CircularProgress,
    Button,
    Chip,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    useTheme
} from '@mui/material';
import {
    ArrowBack,
    Email,
    Phone,
    School,
    Person,
    Telegram,
    CalendarToday,
    Update,
    Send,
    Person as StudentIcon,
    PersonOutline as TeacherIcon,
    AdminPanelSettings as AdminIcon,
    SupportAgent as SupportIcon
} from '@mui/icons-material';
import { db, auth } from '@src/firebase';
import {
    doc,
    getDoc
} from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { createOrGetChat } from '@services/chatService';

// Конфигурация ролей
const ROLES = {
    student: {
        value: 'student',
        label: 'Студент',
        icon: <StudentIcon color="primary" />,
        color: 'secondary'
    },
    teacher: {
        value: 'teacher',
        label: 'Преподаватель',
        icon: <TeacherIcon color="primary" />,
        color: 'primary'
    },
    admin: {
        value: 'admin',
        label: 'Администратор',
        icon: <AdminIcon color="primary" />,
        color: 'error'
    },
    support: {
        value: 'support',
        label: 'Техподдержка',
        icon: <SupportIcon color="primary" />,
        color: 'warning'
    }
};

export default function User() {
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);

                if (!userId) {
                    navigate('/');
                    return;
                }

                const userDocRef = doc(db, 'users', userId);
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    throw new Error('Пользователь не найден');
                }

                setProfile({
                    id: userDoc.id,
                    ...userDoc.data()
                });
            } catch (err) {
                console.error("Error loading profile:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [userId, navigate]);

    const handleBackClick = () => {
        navigate(-1);
    };

    const startChat = async () => {
        try {
            if (!auth.currentUser) {
                console.log('Пользователь не авторизован, перенаправляем на /login');
                navigate('/login');
                return;
            }
            const chatId = await createOrGetChat(userId);
            const chatPath = `/chat/${chatId}`;
            navigate(chatPath);
        } catch (error) {
            setError(error.message || 'Не удалось начать чат');
            alert(`Ошибка: ${error.message}`);
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'Не указана';

        const date = timestamp.toDate();
        const options = {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };

        return date.toLocaleDateString('ru-RU', options);
    };

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100dvh',
                bgcolor: 'background.default'
            }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: 'background.default',
                height: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
                <Typography variant="h6" color="error" gutterBottom>
                    Ошибка загрузки профиля
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                    {error}
                </Typography>
                <Button
                    onClick={handleBackClick}
                    variant="contained"
                    sx={{
                        alignSelf: 'center',
                        borderRadius: '12px',
                        px: 3,
                        py: 1
                    }}
                >
                    Назад
                </Button>
            </Box>
        );
    }

    if (!profile) {
        return null;
    }

    // Получаем конфигурацию роли
    const roleConfig = ROLES[profile.accountType] || {
        value: profile.accountType,
        label: profile.accountType,
        icon: <Person color="primary" />,
        color: 'default'
    };

    return (
        <Box sx={{
            height: '100%',
            bgcolor: 'background.default',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* App Bar */}
            <Paper elevation={0} sx={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                bgcolor: 'background.paper',
                borderRadius: 0,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                borderBottom: `1px solid ${theme.palette.divider}`
            }}>
                <IconButton
                    onClick={handleBackClick}
                    sx={{ mr: 1 }}
                >
                    <ArrowBack color="primary" />
                </IconButton>
                <Typography variant="h6" sx={{
                    flexGrow: 1,
                    fontWeight: 600,
                    color: 'text.primary'
                }}>
                    Публичный профиль
                </Typography>
            </Paper>

            {/* Profile Content */}
            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                p: 3,
                pb: 6
            }}>
                {/* Profile Header */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: 4,
                    textAlign: 'center'
                }}>
                    <Avatar
                        src={profile.avatarUrl}
                        sx={{
                            width: 96,
                            height: 96,
                            mb: 2,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            fontSize: '2.5rem',
                            boxShadow: theme.shadows[2]
                        }}
                    >
                        {profile.fullName?.charAt(0)}
                    </Avatar>

                    <Typography variant="h5" gutterBottom sx={{
                        fontWeight: 700,
                        color: 'text.primary'
                    }}>
                        {profile.fullName}
                    </Typography>

                    <Chip
                        icon={roleConfig.icon}
                        label={roleConfig.label}
                        size="small"
                        sx={{
                            bgcolor: 'background.paper',
                            color: `background.paper.contrastText`,
                            mb: 2
                        }}
                    />

                    {profile.bio && (
                        <Typography variant="body1" sx={{
                            color: 'text.secondary',
                            maxWidth: '400px',
                            mb: 2
                        }}>
                            {profile.bio}
                        </Typography>
                    )}

                    {/* Кнопка "Написать" */}
                    <Button
                        variant="contained"
                        startIcon={<Send />}
                        onClick={startChat}
                        sx={{
                            borderRadius: '12px',
                            px: 3,
                            py: 1,
                            mt: 1,
                            textTransform: 'none',
                            fontWeight: 500,
                            '&.Mui-selected, &:focus': { outline: 'none' }
                        }}
                    >
                        Написать сообщение
                    </Button>
                </Box>

                {/* User Info Sections */}
                <Paper elevation={0} sx={{
                    mb: 3,
                    bgcolor: 'background.paper',
                    borderRadius: '12px',
                    overflow: 'hidden'
                }}>
                    <List disablePadding>
                        {/* Email */}
                        <ListItem>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <Email color="primary" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Email"
                                secondary={profile.email || 'Не указан'}
                                secondaryTypographyProps={{
                                    color: profile.email ? 'text.secondary' : 'text.disabled'
                                }}
                            />
                        </ListItem>

                        {/* Phone */}
                        <ListItem>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <Phone color="primary" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Телефон"
                                secondary={profile.phone || 'Не указан'}
                                secondaryTypographyProps={{
                                    color: profile.phone ? 'text.secondary' : 'text.disabled'
                                }}
                            />
                        </ListItem>

                        {/* Telegram */}
                        <ListItem>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <Telegram color="primary" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Telegram"
                                secondary={profile.telegramUrl ?
                                    `@${profile.telegramUrl.replace('https://t.me/', '')}` :
                                    'Не указан'}
                                secondaryTypographyProps={{
                                    color: profile.telegramUrl ? 'text.secondary' : 'text.disabled'
                                }}
                            />
                        </ListItem>
                    </List>
                </Paper>

                {/* Student Info */}
                {profile.accountType === 'student' && profile.studentGroup && (
                    <Paper elevation={0} sx={{
                        mb: 3,
                        bgcolor: 'background.paper',
                        borderRadius: '12px',
                        overflow: 'hidden'
                    }}>
                        <List disablePadding>
                            <ListItem>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <School color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Учебная группа"
                                    secondary={profile.studentGroup}
                                />
                            </ListItem>
                        </List>
                    </Paper>
                )}

                {/* Account Info */}
                <Paper elevation={0} sx={{
                    mb: 3,
                    bgcolor: 'background.paper',
                    borderRadius: '12px',
                    overflow: 'hidden'
                }}>
                    <List disablePadding>
                        <ListItem>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <Person color="primary" />
                            </ListItemIcon>
                            <ListItemText
                                primary="ID пользователя"
                                secondary={userId}
                                secondaryTypographyProps={{
                                    fontFamily: 'monospace'
                                }}
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <CalendarToday color="primary" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Дата регистрации"
                                secondary={formatTimestamp(profile.createdAt)}
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <Update color="primary" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Последнее обновление"
                                secondary={formatTimestamp(profile.updatedAt)}
                            />
                        </ListItem>
                    </List>
                </Paper>
            </Box>
        </Box>
    );
}
