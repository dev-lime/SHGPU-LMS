import React, { useState, useCallback, useEffect } from 'react';
import {
    Box,
    Typography,
    Avatar,
    IconButton,
    CircularProgress,
    Button,
    Chip,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    TextField,
    FormControl,
    FormHelperText,
    Dialog,
    DialogTitle,
    DialogContent,
    Select,
    MenuItem,
    InputLabel,
    Tabs,
    Tab,
    Menu,
    useTheme,
    LinearProgress
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
    Edit,
    ExitToApp,
    Delete,
    Close as CloseIcon,
    Link as LinkIcon,
    CloudUpload,
    MoreVert,
    Lock
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '@src/firebase';
import useProfile from '@hooks/useProfile';
import { createOrGetChat } from '@services/chatService';
import {
    getTelegramError,
    getPhoneError,
    getGroupError,
    normalizeGroupName,
    getImageUrlError,
    getUserNameError,
    validateEmail,
    getPasswordError,
    getPasswordStrength,
    getPasswordStrengthText
} from '@utils/validators';
import { reauthenticateWithCredential, EmailAuthProvider, updateEmail, updatePassword } from 'firebase/auth';

const UserProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();

    const {
        userData: profile,
        loading,
        error,
        updateUserData,
        handleLogout,
        getAccountTypeIcon,
        getAccountTypeLabel,
        ACCOUNT_TYPES,
        isOwnProfile
    } = useProfile(userId);

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        studentGroup: '',
        accountType: 'student',
        telegramUrl: '',
        avatarUrl: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        newEmail: ''
    });
    const [uploading, setUploading] = useState(false);
    const [openAvatarDialog, setOpenAvatarDialog] = useState(false);
    const [avatarTab, setAvatarTab] = useState(0);
    const [avatarUrlInput, setAvatarUrlInput] = useState('');
    const [avatarUrlError, setAvatarUrlError] = useState('');
    const [telegramError, setTelegramError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [groupError, setGroupError] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [strengthText, setStrengthText] = useState('');
    const [openSecurityDialog, setOpenSecurityDialog] = useState(false);
    const [securityTab, setSecurityTab] = useState(0);

    const openMenu = Boolean(anchorEl);

    // Инициализация formData при загрузке профиля
    useEffect(() => {
        if (profile && isOwnProfile) {
            setFormData({
                fullName: profile.fullName || '',
                phone: profile.phone || '',
                studentGroup: profile.studentGroup || '',
                accountType: profile.accountType || 'student',
                telegramUrl: profile.telegramUrl || '',
                avatarUrl: profile.avatarUrl || '',
                email: profile.email || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
                newEmail: profile.email || ''
            });
        }
    }, [profile, isOwnProfile]);

    useEffect(() => {
        if (formData.newPassword) {
            const strength = getPasswordStrength(formData.newPassword);
            setPasswordStrength(strength);
            setStrengthText(getPasswordStrengthText(strength));
        } else {
            setPasswordStrength(0);
            setStrengthText('');
        }
    }, [formData.newPassword]);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    const startChat = async () => {
        try {
            if (!auth.currentUser) {
                navigate('/login');
                return;
            }

            if (!userId || userId === auth.currentUser.uid) {
                alert('Невозможно начать чат с самим собой');
                return;
            }

            const chatId = await createOrGetChat(userId);
            navigate(`/chat/${chatId}`);
        } catch (error) {
            console.error("Ошибка при создании чата:", error);
            alert(`Ошибка: ${error.message}`);
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'Не указана';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleTelegramChange = useCallback((e) => {
        const url = e.target.value;
        setFormData(prev => ({ ...prev, telegramUrl: url }));
        setTelegramError(getTelegramError(url));
    }, []);

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

    const handleNameChange = useCallback((e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, fullName: value }));
        setNameError(getUserNameError(value));
    }, []);

    const handleEmailChange = useCallback((e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, newEmail: value }));
        setEmailError(validateEmail(value) ? '' : 'Введите корректный email');
    }, []);

    const handlePasswordChange = useCallback((field) => (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));

        if (field === 'newPassword') {
            setPasswordError(getPasswordError(value));
        } else if (field === 'confirmPassword') {
            setConfirmPasswordError(
                value !== formData.newPassword ? 'Пароли не совпадают' : ''
            );
        }
    }, [formData.newPassword]);

    const handleAvatarUrlSubmit = () => {
        const error = getImageUrlError(avatarUrlInput);
        if (error) {
            setAvatarUrlError(error);
            return;
        }

        setFormData(prev => ({ ...prev, avatarUrl: avatarUrlInput }));
        setAvatarUrlError('');
        setOpenAvatarDialog(false);
    };

    const handleFileUpload = useCallback(async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('Максимальный размер файла - 5MB');
            return;
        }

        setUploading(true);
        try {
            const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setFormData(prev => ({ ...prev, avatarUrl: url }));
            setOpenAvatarDialog(false);
        } catch (err) {
            console.error("Ошибка загрузки аватара:", err);
            alert('Не удалось загрузить изображение');
        } finally {
            setUploading(false);
        }
    }, []);

    const updateEmailHandler = async () => {
        if (!formData.currentPassword) {
            alert('Введите текущий пароль для подтверждения изменений');
            return;
        }

        if (formData.newEmail === formData.email) {
            alert('Новый email совпадает с текущим');
            return;
        }

        try {
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);

            // Реаутентификация пользователя
            await reauthenticateWithCredential(user, credential);

            // Обновление email
            await updateEmail(user, formData.newEmail);

            // Обновление email в профиле
            await updateUserData({ email: formData.newEmail });

            alert('Email успешно изменен');
            setFormData(prev => ({ ...prev, email: formData.newEmail, currentPassword: '' }));
        } catch (error) {
            console.error('Ошибка обновления email:', error);
            alert(`Ошибка: ${error.message}`);
        }
    };

    const updatePasswordHandler = async () => {
        if (!formData.currentPassword) {
            alert('Введите текущий пароль для подтверждения изменений');
            return;
        }

        try {
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);

            // Реаутентификация пользователя
            await reauthenticateWithCredential(user, credential);

            // Обновление пароля
            await updatePassword(user, formData.newPassword);

            alert('Пароль успешно изменен');
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        } catch (error) {
            console.error('Ошибка обновления пароля:', error);
            alert(`Ошибка: ${error.message}`);
        }
    };

    const handleSaveChanges = useCallback(async () => {
        if (telegramError || phoneError || groupError || nameError) return;

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
                avatarUrl: formData.avatarUrl || null
            };

            await updateUserData(updatedData);
            setEditMode(false);
        } catch (err) {
            console.error("Ошибка сохранения:", err);
        }
    }, [formData, telegramError, phoneError, groupError, nameError, updateUserData]);

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
                height: '100%',
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

    const roleConfig = ACCOUNT_TYPES[profile.accountType] || {
        value: profile.accountType,
        label: profile.accountType,
        icon: <Person color="primary" />,
        color: 'default'
    };

    return (
        <Box sx={{
            height: '100%',
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
                    {editMode ? 'Редактирование профиля' : 'Профиль'}
                </Typography>

                {isOwnProfile && !editMode && (
                    <>
                        <IconButton
                            aria-label="more"
                            aria-controls="profile-menu"
                            aria-haspopup="true"
                            onClick={handleMenuClick}
                            color="inherit"
                        >
                            <MoreVert />
                        </IconButton>
                        <Menu
                            id="profile-menu"
                            anchorEl={anchorEl}
                            open={openMenu}
                            onClose={handleMenuClose}
                            MenuListProps={{
                                'aria-labelledby': 'profile-menu',
                            }}
                        >
                            <MenuItem onClick={() => {
                                setEditMode(true);
                                handleMenuClose();
                            }}>
                                <ListItemIcon>
                                    <Edit fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Редактировать профиль</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => {
                                setOpenSecurityDialog(true);
                                setSecurityTab(0);
                                handleMenuClose();
                            }}>
                                <ListItemIcon>
                                    <Email fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Изменить email</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => {
                                setOpenSecurityDialog(true);
                                setSecurityTab(1);
                                handleMenuClose();
                            }}>
                                <ListItemIcon>
                                    <Lock fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Изменить пароль</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => {
                                handleLogout();
                                handleMenuClose();
                            }}>
                                <ListItemIcon>
                                    <ExitToApp fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Выйти</ListItemText>
                            </MenuItem>
                        </Menu>
                    </>
                )}
            </Paper>

            {/* Profile Content */}
            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                p: 3,
                pb: 6
            }}>
                {editMode ? (
                    // Режим редактирования (только для своего профиля)
                    <>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                            <Avatar
                                src={formData.avatarUrl}
                                sx={{
                                    width: 96,
                                    height: 96,
                                    mb: 2,
                                    fontSize: '2.5rem',
                                    cursor: 'pointer',
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    boxShadow: theme.shadows[2]
                                }}
                                onClick={() => {
                                    setAvatarUrlInput(formData.avatarUrl || '');
                                    setOpenAvatarDialog(true);
                                }}
                            >
                                {formData.fullName.charAt(0) || 'U'}
                            </Avatar>
                            {formData.avatarUrl && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    startIcon={<Delete />}
                                    onClick={() => setFormData(prev => ({ ...prev, avatarUrl: '' }))}
                                >
                                    Удалить аватар
                                </Button>
                            )}
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Нажмите на аватар для изменения
                            </Typography>
                        </Box>

                        <TextField
                            fullWidth
                            label="ФИО"
                            margin="normal"
                            value={formData.fullName}
                            onChange={handleNameChange}
                            error={!!nameError}
                            helperText={nameError}
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
                                disabled={loading || !!telegramError || !!phoneError || !!groupError || !!nameError}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Сохранить'}
                            </Button>
                        </Box>
                    </>
                ) : (
                    // Режим просмотра (для своего и чужого профиля)
                    <>
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

                            {/* Кнопка "Написать" (только для чужого профиля) */}
                            {!isOwnProfile && (
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
                            )}
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
                                        secondary={profile.id}
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
                    </>
                )}
            </Box>

            {/* Диалог изменения аватара */}
            <Dialog open={openAvatarDialog} onClose={() => setOpenAvatarDialog(false)} fullWidth maxWidth="sm">
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
                <DialogContent>
                    <Tabs value={avatarTab} onChange={(e, newValue) => setAvatarTab(newValue)} sx={{ mb: 2 }}>
                        <Tab
                            icon={<CloudUpload />}
                            label="Загрузить файл"
                            sx={{
                                '&.Mui-selected': { outline: 'none' },
                                '&:focus': { outline: 'none' }
                            }} />
                        <Tab
                            icon={<LinkIcon />}
                            label="Указать ссылку"
                            sx={{
                                '&.Mui-selected': { outline: 'none' },
                                '&:focus': { outline: 'none' }
                            }} />
                    </Tabs>

                    {avatarTab === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
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
                                    startIcon={<CloudUpload />}
                                    sx={{ mb: 2 }}
                                >
                                    {uploading ? 'Загрузка...' : 'Выбрать изображение'}
                                </Button>
                            </label>
                            <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                                Максимальный размер файла: 5MB
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ py: 2 }}>
                            <TextField
                                fullWidth
                                label="Ссылка на изображение"
                                value={avatarUrlInput}
                                onChange={(e) => setAvatarUrlInput(e.target.value)}
                                placeholder="https://example.com/avatar.jpg"
                                error={!!avatarUrlError}
                                helperText={avatarUrlError || 'Поддерживаются форматы: JPEG, JPG, PNG, GIF, WEBP'}
                            />
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    onClick={handleAvatarUrlSubmit}
                                    disabled={!avatarUrlInput}
                                >
                                    Применить
                                </Button>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Диалог изменения email и пароля */}
            <Dialog open={openSecurityDialog} onClose={() => setOpenSecurityDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>
                    Изменить данные безопасности
                    <IconButton
                        aria-label="close"
                        onClick={() => setOpenSecurityDialog(false)}
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
                <DialogContent>
                    <Tabs
                        value={securityTab}
                        onChange={(e, newValue) => setSecurityTab(newValue)}
                        variant="fullWidth"
                        sx={{ mb: 2 }}
                    >
                        <Tab
                            label="Изменить email"
                            icon={<Email />}
                            sx={{
                                '&.Mui-selected': { outline: 'none' },
                                '&:focus': { outline: 'none' }
                            }}
                        />
                        <Tab
                            label="Изменить пароль"
                            icon={<Lock />}
                            sx={{
                                '&.Mui-selected': { outline: 'none' },
                                '&:focus': { outline: 'none' }
                            }}
                        />
                    </Tabs>

                    {securityTab === 0 ? (
                        // Вкладка изменения email
                        <Box sx={{ py: 2 }}>
                            <TextField
                                fullWidth
                                label="Текущий пароль"
                                type="password"
                                margin="normal"
                                value={formData.currentPassword}
                                onChange={handlePasswordChange('currentPassword')}
                                InputProps={{
                                    startAdornment: <Lock color="primary" />
                                }}
                                required
                            />

                            <TextField
                                fullWidth
                                label="Новый email"
                                margin="normal"
                                value={formData.newEmail}
                                onChange={handleEmailChange}
                                error={!!emailError}
                                helperText={emailError}
                                InputProps={{
                                    startAdornment: <Email color="primary" />
                                }}
                            />

                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setOpenSecurityDialog(false)}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={updateEmailHandler}
                                    disabled={
                                        !formData.currentPassword ||
                                        !formData.newEmail ||
                                        !!emailError ||
                                        formData.newEmail === formData.email
                                    }
                                >
                                    Сохранить
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        // Вкладка изменения пароля
                        <Box sx={{ py: 2 }}>
                            <TextField
                                fullWidth
                                label="Текущий пароль"
                                type="password"
                                margin="normal"
                                value={formData.currentPassword}
                                onChange={handlePasswordChange('currentPassword')}
                                InputProps={{
                                    startAdornment: <Lock color="primary" />
                                }}
                                required
                            />

                            <TextField
                                fullWidth
                                label="Новый пароль"
                                type="password"
                                margin="normal"
                                value={formData.newPassword}
                                onChange={handlePasswordChange('newPassword')}
                                error={!!passwordError}
                                helperText={passwordError}
                                InputProps={{
                                    startAdornment: <Lock color="primary" />
                                }}
                            />

                            {formData.newPassword && (
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

                            <TextField
                                fullWidth
                                label="Подтвердите новый пароль"
                                type="password"
                                margin="normal"
                                value={formData.confirmPassword}
                                onChange={handlePasswordChange('confirmPassword')}
                                error={!!confirmPasswordError}
                                helperText={confirmPasswordError}
                                InputProps={{
                                    startAdornment: <Lock color="primary" />
                                }}
                            />

                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setOpenSecurityDialog(false)}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={updatePasswordHandler}
                                    disabled={
                                        !formData.currentPassword ||
                                        !formData.newPassword ||
                                        !!passwordError ||
                                        !!confirmPasswordError ||
                                        formData.newPassword !== formData.confirmPassword
                                    }
                                >
                                    Сохранить
                                </Button>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default UserProfile;
