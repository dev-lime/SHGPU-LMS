import React from 'react';
import { ListItem, Avatar, Typography, Box } from '@mui/material';
import {
    School as StudentIcon,
    SupervisorAccount as TeacherIcon,
    AdminPanelSettings as AdminIcon,
    SupportAgent as SupportIcon,
    Person as DefaultIcon
} from '@mui/icons-material';

const ProfileSection = ({ user, onClick }) => {
    // Проверяем авторизацию
    const isAuthenticated = !!user?.uid;

    // Получаем данные из профиля Firestore
    const userData = user?.userData || {};

    // Получаем первую букву для аватара
    const getAvatarContent = () => {
        if (userData.avatarUrl) return null; // показываем изображение
        if (isAuthenticated) {
            return userData.fullName?.charAt(0)?.toUpperCase() ||
                user?.email?.charAt(0)?.toUpperCase() || 'П';
        }
        return 'Г'; // для гостя
    };

    // Определяем отображаемое имя
    const getDisplayName = () => {
        if (!isAuthenticated) return 'Гость';
        return userData.fullName || user?.email?.split('@')[0] || 'Пользователь';
    };

    // Получаем иконку для роли
    const getRoleIcon = () => {
        const iconProps = { fontSize: 'small', sx: { mr: 0.5 } };

        switch (userData.accountType) {
            case 'student':
                return <StudentIcon color="primary" {...iconProps} />;
            case 'teacher':
                return <TeacherIcon color="primary" {...iconProps} />;
            case 'admin':
                return <AdminIcon color="primary" {...iconProps} />;
            case 'support':
                return <SupportIcon color="primary" {...iconProps} />;
            default:
                return <DefaultIcon color="primary" {...iconProps} />;
        }
    };

    // Определяем текст роли и группы
    const getRoleText = () => {
        if (!isAuthenticated) return 'Гостевой режим';

        const roles = {
            'student': 'Студент',
            'teacher': 'Преподаватель',
            'admin': 'Администратор',
            'support': 'Техподдержка'
        };

        const role = roles[userData.accountType] || 'Пользователь';

        // Добавляем группу для студентов
        if (userData.accountType === 'student' && userData.studentGroup) {
            return `${role}, ${userData.studentGroup}`;
        }

        return role;
    };

    return (
        <ListItem
            onClick={onClick}
            sx={{
                py: 2,
                px: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                '&:hover': {
                    backgroundColor: 'action.hover',
                    cursor: 'pointer'
                }
            }}
        >
            <Avatar
                src={userData.avatarUrl || ''}
                sx={{
                    width: 96,
                    height: 96,
                    mb: 2,
                    bgcolor: isAuthenticated ? 'primary.main' : 'grey.500',
                    fontSize: 40,
                    '&:hover': {
                        opacity: 0.8,
                        transition: 'opacity 0.2s ease-in-out'
                    }
                }}
            >
                {getAvatarContent()}
            </Avatar>
            <Typography variant="h6" align="center" noWrap sx={{ maxWidth: '100%' }}>
                {getDisplayName()}
            </Typography>
            <Box component="div" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getRoleIcon()}
                <Typography variant="body2" color="text.secondary" component="span">
                    {getRoleText()}
                </Typography>
            </Box>
        </ListItem>
    );
};

export default ProfileSection;
