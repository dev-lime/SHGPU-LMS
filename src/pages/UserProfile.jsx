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
    Lock,
	Badge
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '@src/firebase';
import {
    reauthenticateWithCredential,
    EmailAuthProvider,
    updateEmail,
    updatePassword
} from 'firebase/auth';
import useProfile from '@hooks/useProfile';
import useField from '@hooks/useField';
import useDialog from '@hooks/useDialog';
import usePasswordStrength from '@hooks/usePasswordStrength';
import { createOrGetChat } from '@services/chatService';
import { getGroupId } from '@services/groupService';
import {
    getTelegramError,
    getPhoneError,
    getGroupError,
    normalizeGroupName,
    getImageUrlError,
    validateEmail,
    getPasswordError
} from '@utils/validators';
import { formatName, getInitials } from '@utils/formatName';
import { FACULTIES } from '@constants/faculties';

const UserProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const avatarDialog = useDialog();
    const securityDialog = useDialog();

    const {
        userData: profile,
        loading,
        error,
        updateUserData,
        handleLogout,
        ACCOUNT_TYPES,
        isOwnProfile
    } = useProfile(userId);

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        lastName: '', firstName: '', patronymic: '', phone: '', studentGroup: '',
        accountType: 'student', telegramUrl: '', avatarUrl: '', email: '',
        faculty: '', department: '', position: '', studentId: '',
        currentPassword: '', newPassword: '', confirmPassword: '', newEmail: ''
    });
    const [uploading, setUploading] = useState(false);
    const [avatarTab, setAvatarTab] = useState(0);
    const [avatarUrlInput, setAvatarUrlInput] = useState('');
    const [avatarUrlError, setAvatarUrlError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [securityTab, setSecurityTab] = useState(0);

    const phoneField = useField('', getPhoneError);
    const groupField = useField('', getGroupError);
    const telegramField = useField('', getTelegramError);
    const { strength, strengthText } = usePasswordStrength(formData.newPassword);

    const openMenu = Boolean(anchorEl);

    useEffect(() => {
        if (profile && isOwnProfile) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                lastName: profile.lastName || '',
                firstName: profile.firstName || '',
                patronymic: profile.patronymic || '',
                phone: profile.phone || '',
                studentGroup: profile.studentGroup || '',
                accountType: profile.accountType || 'student',
                telegramUrl: profile.telegramUrl || '',
                avatarUrl: profile.avatarUrl || '',
                email: profile.email || '',
                faculty: profile.faculty || '',
                department: profile.department || '',
                position: profile.position || '',
                studentId: profile.studentId || '',
                currentPassword: '', newPassword: '', confirmPassword: '',
                newEmail: profile.email || ''
            });
        }
    }, [profile, isOwnProfile]);

    const handleInputChange = useCallback((field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    }, []);

    const handlePhoneChange = useCallback((e) => {
        phoneField.onChange(e);
        setFormData(prev => ({ ...prev, phone: e.target.value }));
    }, [phoneField]);

    const handleGroupChange = useCallback((e) => {
        groupField.onChange(e);
        setFormData(prev => ({ ...prev, studentGroup: e.target.value }));
    }, [groupField]);

    const handleTelegramChange = useCallback((e) => {
        telegramField.onChange(e);
        setFormData(prev => ({ ...prev, telegramUrl: e.target.value }));
    }, [telegramField]);

    const handleEmailChange = useCallback((e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, newEmail: value }));
        setEmailError(validateEmail(value) ? '' : 'Введите корректный email');
    }, []);

    const handlePasswordChange = useCallback((field) => (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === 'confirmPassword') {
            setConfirmPasswordError(
                value !== formData.newPassword ? 'Пароли не совпадают' : ''
            );
        }
    }, [formData.newPassword]);

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
            avatarDialog.handleClose();
        } catch (err) {
            console.error("Ошибка загрузки аватара:", err);
            alert('Не удалось загрузить изображение');
        } finally {
            setUploading(false);
        }
    }, [avatarDialog]);

    const handleAvatarUrlSubmit = () => {
        const error = getImageUrlError(avatarUrlInput);
        if (error) {
            setAvatarUrlError(error);
            return;
        }
        setFormData(prev => ({ ...prev, avatarUrl: avatarUrlInput }));
        setAvatarUrlError('');
        avatarDialog.handleClose();
    };

    const startChat = async () => {
        try {
            if (!auth.currentUser) { navigate('/login'); return; }
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
            await reauthenticateWithCredential(user, credential);
            await updateEmail(user, formData.newEmail);
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
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, formData.newPassword);
            alert('Пароль успешно изменен');
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        } catch (error) {
            console.error('Ошибка обновления пароля:', error);
            alert(`Ошибка: ${error.message}`);
        }
    };

    const handleSaveChanges = useCallback(async () => {
        if (phoneField.error || groupField.error || telegramField.error) return;

        try {
            let formattedTelegramUrl = formData.telegramUrl;
            if (formData.telegramUrl && !formData.telegramUrl.startsWith('https://t.me/')) {
                formattedTelegramUrl = `https://t.me/${formData.telegramUrl.replace(/^@/, '')}`;
            }
            const normalizedGroup = formData.accountType === 'student' ? normalizeGroupName(formData.studentGroup) : '';
            const groupId = normalizedGroup ? await getGroupId(normalizedGroup) : null;

            await updateUserData({
                lastName: formData.lastName,
                firstName: formData.firstName,
                patronymic: formData.patronymic,
                phone: formData.phone,
                studentGroup: normalizedGroup,
                groupId,
                accountType: formData.accountType,
                telegramUrl: formattedTelegramUrl,
                avatarUrl: formData.avatarUrl || null,
                faculty: formData.faculty,
                department: formData.department,
                position: formData.position,
                studentId: formData.studentId
            });
            setEditMode(false);
        } catch (err) {
            console.error("Ошибка сохранения:", err);
        }
    }, [formData, phoneField.error, groupField.error, telegramField.error, updateUserData]);

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'Не указана';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh', bgcolor: 'background.default' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h6" color="error" gutterBottom>Ошибка загрузки профиля</Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>{error}</Typography>
                <Button onClick={() => navigate(-1)} variant="contained"
                    sx={{ alignSelf: 'center', borderRadius: '12px', px: 3, py: 1 }}>
                    Назад
                </Button>
            </Box>
        );
    }

    if (!profile) return null;

    const roleConfig = ACCOUNT_TYPES[profile.accountType] || {
        value: profile.accountType, label: profile.accountType,
        icon: <Person color="primary" />, color: 'default'
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Paper elevation={0} sx={{
                position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.paper',
                borderRadius: 0, p: 1, display: 'flex', alignItems: 'center',
                borderBottom: `1px solid ${theme.palette.divider}`
            }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                    <ArrowBack color="primary" />
                </IconButton>
                <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, color: 'text.primary' }}>
                    {editMode ? 'Редактирование профиля' : 'Профиль'}
                </Typography>

                {isOwnProfile && !editMode && (
                    <>
                        <IconButton aria-label="more" onClick={(e) => setAnchorEl(e.currentTarget)} color="inherit">
                            <MoreVert />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={openMenu}
                            onClose={() => setAnchorEl(null)}
                        >
                            <MenuItem onClick={() => { setEditMode(true); setAnchorEl(null); }}>
                                <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
                                <ListItemText>Редактировать профиль</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => { securityDialog.handleOpen(); setSecurityTab(0); setAnchorEl(null); }}>
                                <ListItemIcon><Email fontSize="small" /></ListItemIcon>
                                <ListItemText>Изменить email</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => { securityDialog.handleOpen(); setSecurityTab(1); setAnchorEl(null); }}>
                                <ListItemIcon><Lock fontSize="small" /></ListItemIcon>
                                <ListItemText>Изменить пароль</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => { handleLogout(); setAnchorEl(null); }}>
                                <ListItemIcon><ExitToApp fontSize="small" /></ListItemIcon>
                                <ListItemText>Выйти</ListItemText>
                            </MenuItem>
                        </Menu>
                    </>
                )}
            </Paper>

            <Box sx={{ flex: 1, overflowY: 'auto', p: 3, pb: 6 }}>
                {editMode ? (
                    <>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                            <Avatar src={formData.avatarUrl}
                                sx={{
                                    width: 96, height: 96, mb: 2, fontSize: '2.5rem',
                                    cursor: 'pointer', bgcolor: 'primary.main',
                                    color: 'primary.contrastText', boxShadow: theme.shadows[2]
                                }}
                                onClick={() => { setAvatarUrlInput(formData.avatarUrl || ''); avatarDialog.handleOpen(); }}>
                                {(formData.lastName?.[0] || formData.firstName?.[0] || 'U')}
                            </Avatar>
                            {formData.avatarUrl && (
                                <Button variant="outlined" color="error" size="small"
                                    startIcon={<Delete />}
                                    onClick={() => setFormData(prev => ({ ...prev, avatarUrl: '' }))}>
                                    Удалить аватар
                                </Button>
                            )}
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Нажмите на аватар для изменения
                            </Typography>
                        </Box>

                        <TextField fullWidth label="Фамилия" margin="normal" value={formData.lastName}
                            onChange={handleInputChange('lastName')} required />
                        <TextField fullWidth label="Имя" margin="normal" value={formData.firstName}
                            onChange={handleInputChange('firstName')} required />
                        <TextField fullWidth label="Отчество" margin="normal" value={formData.patronymic}
                            onChange={handleInputChange('patronymic')} />

                        <TextField fullWidth label="Телефон" margin="normal" value={formData.phone}
                            onChange={handlePhoneChange} error={!!phoneField.error}
                            InputProps={{ startAdornment: <Phone color="primary" /> }} />
                        {phoneField.error && <FormHelperText error>{phoneField.error}</FormHelperText>}

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Тип аккаунта</InputLabel>
                            <Select value={formData.accountType} label="Тип аккаунта"
                                onChange={handleInputChange('accountType')}>
                                {Object.values(ACCOUNT_TYPES).map((type) => (
                                    <MenuItem key={type.value} value={type.value}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {type.icon}{type.label}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {formData.accountType === 'student' && (
                            <>
                                <TextField fullWidth label="Группа" margin="normal"
                                    value={formData.studentGroup} onChange={handleGroupChange}
                                    error={!!groupField.error}
                                    InputProps={{ startAdornment: <School color="primary" /> }}
                                    helperText={groupField.error || 'Пример: 230б, 133б-а, 2-11б'} />
                                <TextField fullWidth label="Номер студенческого" margin="normal"
                                    value={formData.studentId} onChange={handleInputChange('studentId')}
                                    InputProps={{ startAdornment: <Badge color="primary" /> }} />
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Факультет</InputLabel>
                                    <Select value={formData.faculty} onChange={handleInputChange('faculty')}
                                        label="Факультет">
                                        {FACULTIES.map((f) => (
                                            <MenuItem key={f} value={f}>{f}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </>
                        )}

                        {(formData.accountType === 'teacher' || formData.accountType === 'employee') && (
                            <>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Факультет</InputLabel>
                                    <Select value={formData.faculty} onChange={handleInputChange('faculty')}
                                        label="Факультет">
                                        {FACULTIES.map((f) => (
                                            <MenuItem key={f} value={f}>{f}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField fullWidth label="Кафедра / Отдел" margin="normal"
                                    value={formData.department} onChange={handleInputChange('department')} />
                                <TextField fullWidth label="Должность" margin="normal"
                                    value={formData.position} onChange={handleInputChange('position')} />
                            </>
                        )}

                        <TextField fullWidth label="Telegram" margin="normal" value={formData.telegramUrl}
                            onChange={handleTelegramChange} error={!!telegramField.error}
                            InputProps={{ startAdornment: <Telegram color="primary" /> }}
                            placeholder="@username или t.me/username" />
                        {telegramField.error && <FormHelperText error>{telegramField.error}</FormHelperText>}

                        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                            <Button fullWidth variant="outlined" onClick={() => setEditMode(false)} disabled={loading}>
                                Отмена
                            </Button>
                            <Button fullWidth variant="contained" onClick={handleSaveChanges}
                                disabled={loading || !!phoneField.error || !!groupField.error || !!telegramField.error}>
                                {loading ? <CircularProgress size={24} /> : 'Сохранить'}
                            </Button>
                        </Box>
                    </>
                ) : (
                    <>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4, textAlign: 'center' }}>
                            <Avatar src={profile.avatarUrl}
                                sx={{ width: 96, height: 96, mb: 2, bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: '2.5rem', boxShadow: theme.shadows[2] }}>
                                {getInitials(profile)}
                            </Avatar>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
                                {formatName(profile)}
                            </Typography>
                            <Chip icon={roleConfig.icon} label={roleConfig.label} size="small"
                                sx={{ bgcolor: 'background.paper', mb: 2 }} />
                            {profile.position && (
                                <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: '400px', mb: 2 }}>
                                    {profile.position}
                                </Typography>
                            )}
                            {!isOwnProfile && (
                                <Button variant="contained" startIcon={<Send />} onClick={startChat}
                                    sx={{ borderRadius: '12px', px: 3, py: 1, mt: 1, textTransform: 'none', fontWeight: 500 }}>
                                    Написать сообщение
                                </Button>
                            )}
                        </Box>

                        <Paper elevation={0} sx={{ mb: 3, bgcolor: 'background.paper', borderRadius: '12px', overflow: 'hidden' }}>
                            <List disablePadding>
                                <ListItem><ListItemIcon sx={{ minWidth: 36 }}><Email color="primary" /></ListItemIcon>
                                    <ListItemText primary="Email" secondary={profile.email || 'Не указан'}
                                        secondaryTypographyProps={{ color: profile.email ? 'text.secondary' : 'text.disabled' }} />
                                </ListItem>
                                <ListItem><ListItemIcon sx={{ minWidth: 36 }}><Phone color="primary" /></ListItemIcon>
                                    <ListItemText primary="Телефон" secondary={profile.phone || 'Не указан'}
                                        secondaryTypographyProps={{ color: profile.phone ? 'text.secondary' : 'text.disabled' }} />
                                </ListItem>
                                <ListItem><ListItemIcon sx={{ minWidth: 36 }}><Telegram color="primary" /></ListItemIcon>
                                    <ListItemText primary="Telegram"
                                        secondary={profile.telegramUrl ? `@${profile.telegramUrl.replace('https://t.me/', '')}` : 'Не указан'}
                                        secondaryTypographyProps={{ color: profile.telegramUrl ? 'text.secondary' : 'text.disabled' }} />
                                </ListItem>
                            </List>
                        </Paper>

                        {profile.accountType === 'student' && (
                            <Paper elevation={0} sx={{ mb: 3, bgcolor: 'background.paper', borderRadius: '12px', overflow: 'hidden' }}>
                                <List disablePadding>
                                    <ListItem><ListItemIcon sx={{ minWidth: 36 }}><School color="primary" /></ListItemIcon>
                                        <ListItemText primary="Учебная группа" secondary={profile.studentGroup || 'Не указана'} />
                                    </ListItem>
                                    {profile.studentId && (
                                        <ListItem><ListItemIcon sx={{ minWidth: 36 }}><School color="primary" /></ListItemIcon>
                                            <ListItemText primary="Номер студенческого" secondary={profile.studentId} />
                                        </ListItem>
                                    )}
                                    {profile.faculty && (
                                        <ListItem><ListItemIcon sx={{ minWidth: 36 }}><School color="primary" /></ListItemIcon>
                                            <ListItemText primary="Факультет" secondary={profile.faculty} />
                                        </ListItem>
                                    )}
                                </List>
                            </Paper>
                        )}

                        {(profile.accountType === 'teacher' || profile.accountType === 'employee') && (
                            <Paper elevation={0} sx={{ mb: 3, bgcolor: 'background.paper', borderRadius: '12px', overflow: 'hidden' }}>
                                <List disablePadding>
                                    {profile.faculty && (
                                        <ListItem><ListItemIcon sx={{ minWidth: 36 }}><School color="primary" /></ListItemIcon>
                                            <ListItemText primary="Факультет" secondary={profile.faculty} />
                                        </ListItem>
                                    )}
                                    {profile.department && (
                                        <ListItem><ListItemIcon sx={{ minWidth: 36 }}><School color="primary" /></ListItemIcon>
                                            <ListItemText primary="Кафедра / Отдел" secondary={profile.department} />
                                        </ListItem>
                                    )}
                                    {profile.position && (
                                        <ListItem><ListItemIcon sx={{ minWidth: 36 }}><School color="primary" /></ListItemIcon>
                                            <ListItemText primary="Должность" secondary={profile.position} />
                                        </ListItem>
                                    )}
                                </List>
                            </Paper>
                        )}

                        <Paper elevation={0} sx={{ mb: 3, bgcolor: 'background.paper', borderRadius: '12px', overflow: 'hidden' }}>
                            <List disablePadding>
                                <ListItem><ListItemIcon sx={{ minWidth: 36 }}><Person color="primary" /></ListItemIcon>
                                    <ListItemText primary="ID пользователя" secondary={profile.id}
                                        secondaryTypographyProps={{ fontFamily: 'monospace' }} />
                                </ListItem>
                                <ListItem><ListItemIcon sx={{ minWidth: 36 }}><CalendarToday color="primary" /></ListItemIcon>
                                    <ListItemText primary="Дата регистрации" secondary={formatTimestamp(profile.createdAt)} />
                                </ListItem>
                                <ListItem><ListItemIcon sx={{ minWidth: 36 }}><Update color="primary" /></ListItemIcon>
                                    <ListItemText primary="Последнее обновление" secondary={formatTimestamp(profile.updatedAt)} />
                                </ListItem>
                            </List>
                        </Paper>
                    </>
                )}
            </Box>

            <Dialog open={avatarDialog.open} onClose={avatarDialog.handleClose} fullWidth maxWidth="sm">
                <DialogTitle>
                    Изменить аватар
                    <IconButton aria-label="close" onClick={avatarDialog.handleClose}
                        sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Tabs value={avatarTab} onChange={(e, newValue) => setAvatarTab(newValue)} sx={{ mb: 2 }}>
                        <Tab icon={<CloudUpload />} label="Загрузить файл" />
                        <Tab icon={<LinkIcon />} label="Указать ссылку" />
                    </Tabs>
                    {avatarTab === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                            <input accept="image/*" style={{ display: 'none' }} id="avatar-upload" type="file" onChange={handleFileUpload} />
                            <label htmlFor="avatar-upload">
                                <Button variant="contained" component="span" disabled={uploading}
                                    startIcon={<CloudUpload />} sx={{ mb: 2 }}>
                                    {uploading ? 'Загрузка...' : 'Выбрать изображение'}
                                </Button>
                            </label>
                            <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                                Максимальный размер файла: 5MB
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ py: 2 }}>
                            <TextField fullWidth label="Ссылка на изображение" value={avatarUrlInput}
                                onChange={(e) => setAvatarUrlInput(e.target.value)}
                                placeholder="https://example.com/avatar.jpg"
                                error={!!avatarUrlError} helperText={avatarUrlError || 'Поддерживаются форматы: JPEG, JPG, PNG, GIF, WEBP'} />
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" onClick={handleAvatarUrlSubmit} disabled={!avatarUrlInput}>
                                    Применить
                                </Button>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={securityDialog.open} onClose={securityDialog.handleClose} fullWidth maxWidth="sm">
                <DialogTitle>
                    Изменить данные безопасности
                    <IconButton aria-label="close" onClick={securityDialog.handleClose}
                        sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Tabs value={securityTab} onChange={(e, newValue) => setSecurityTab(newValue)}
                        variant="fullWidth" sx={{ mb: 2 }}>
                        <Tab label="Изменить email" icon={<Email />} />
                        <Tab label="Изменить пароль" icon={<Lock />} />
                    </Tabs>

                    {securityTab === 0 ? (
                        <Box sx={{ py: 2 }}>
                            <TextField fullWidth label="Текущий пароль" type="password" margin="normal"
                                value={formData.currentPassword} onChange={handlePasswordChange('currentPassword')}
                                InputProps={{ startAdornment: <Lock color="primary" /> }} required />
                            <TextField fullWidth label="Новый email" margin="normal" value={formData.newEmail}
                                onChange={handleEmailChange} error={!!emailError} helperText={emailError}
                                InputProps={{ startAdornment: <Email color="primary" /> }} />
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button variant="outlined" onClick={securityDialog.handleClose}>Отмена</Button>
                                <Button variant="contained" onClick={updateEmailHandler}
                                    disabled={!formData.currentPassword || !formData.newEmail || !!emailError}>
                                    Сохранить
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ py: 2 }}>
                            <TextField fullWidth label="Текущий пароль" type="password" margin="normal"
                                value={formData.currentPassword} onChange={handlePasswordChange('currentPassword')}
                                InputProps={{ startAdornment: <Lock color="primary" /> }} required />
                            <TextField fullWidth label="Новый пароль" type="password" margin="normal"
                                value={formData.newPassword} onChange={handlePasswordChange('newPassword')}
                                error={!!getPasswordError(formData.newPassword)}
                                helperText={getPasswordError(formData.newPassword)}
                                InputProps={{ startAdornment: <Lock color="primary" /> }} />
                            {formData.newPassword && (
                                <Box sx={{ mt: 1, mb: 2 }}>
                                    <LinearProgress variant="determinate" value={(strength / 4) * 100}
                                        sx={{ height: 6, borderRadius: 3, backgroundColor: '#e0e0e0',
                                            '& .MuiLinearProgress-bar': { backgroundColor: strengthText.color } }} />
                                    <Typography variant="caption" sx={{ color: strengthText.color }}>
                                        {strengthText.text}
                                    </Typography>
                                </Box>
                            )}
                            <TextField fullWidth label="Подтвердите новый пароль" type="password" margin="normal"
                                value={formData.confirmPassword} onChange={handlePasswordChange('confirmPassword')}
                                error={!!confirmPasswordError} helperText={confirmPasswordError}
                                InputProps={{ startAdornment: <Lock color="primary" /> }} />
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button variant="outlined" onClick={securityDialog.handleClose}>Отмена</Button>
                                <Button variant="contained" onClick={updatePasswordHandler}
                                    disabled={!formData.currentPassword || !formData.newPassword}>
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
