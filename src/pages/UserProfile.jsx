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
    DialogActions,
    Select,
    MenuItem,
    InputLabel,
    Tabs,
    Tab,
    Menu,
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
    Edit,
    ExitToApp,
    Delete,
    Close as CloseIcon,
    Link as LinkIcon,
    CloudUpload,
    MoreVert
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@src/firebase';
import useProfile from '@hooks/useProfile';
import { createOrGetChat } from '@services/chatService';
import {
    getTelegramError,
    getPhoneError,
    getGroupError,
    normalizeGroupName,
    getImageUrlError,
    getUserNameError
} from '@utils/validators';

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
        avatarUrl: ''
    });
    const [uploading, setUploading] = useState(false);
    const [openAvatarDialog, setOpenAvatarDialog] = useState(false);
    const [avatarTab, setAvatarTab] = useState(0);
    const [avatarUrlInput, setAvatarUrlInput] = useState('');
    const [avatarUrlError, setAvatarUrlError] = useState('');
    const [telegramError, setTelegramError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [groupError, setGroupError] = useState('');
    const [nameError, setNameError] = useState(''); // Добавлено состояние для ошибки имени
    const [anchorEl, setAnchorEl] = useState(null); // Для меню действий

    const openMenu = Boolean(anchorEl);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Инициализация formData при загрузке профиля
    useEffect(() => {
        if (profile && isOwnProfile) {
            setFormData({
                fullName: profile.fullName || '',
                phone: profile.phone || '',
                studentGroup: profile.studentGroup || '',
                accountType: profile.accountType || 'student',
                telegramUrl: profile.telegramUrl || '',
                avatarUrl: profile.avatarUrl || ''
            });
        }
    }, [profile, isOwnProfile]);

    const handleBackClick = () => {
        navigate(-1);
    };

    const startChat = async () => {
        try {
            if (!auth.currentUser) {
                navigate('/login');
                return;
            }
            const chatId = await createOrGetChat(userId);
            navigate(`/chat/${chatId}`);
        } catch (error) {
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
                                <ListItemText>Редактировать</ListItemText>
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
                                disabled={loading || !!telegramError || !!phoneError || !!groupError}
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
        </Box>
    );
};

export default UserProfile;
