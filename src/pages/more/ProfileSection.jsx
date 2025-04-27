import React from 'react';
import { ListItem, Avatar, Typography, Box, CircularProgress } from '@mui/material';
import useProfile from '@hooks/useProfile';

const ProfileSection = ({ onClick }) => {
    const { userData, loading } = useProfile();

    // Получаем первую букву для аватара
    const getAvatarContent = () => {
        if (userData?.avatarUrl) return null;
        if (userData) {
            return userData.fullName?.charAt(0)?.toUpperCase() ||
                userData.email?.charAt(0)?.toUpperCase() || 'П';
        }
        return 'Г';
    };

    // Определяем отображаемое имя
    const getDisplayName = () => {
        if (!userData) return 'Гость';
        return userData.fullName || userData.email?.split('@')[0] || 'Пользователь';
    };

    // Получаем текст роли и группы
    const getRoleText = () => {
        if (!userData) return 'Гостевой режим';

        let role = 'Пользователь';
        if (userData.accountType === 'student') role = 'Студент';
        if (userData.accountType === 'teacher') role = 'Преподаватель';
        if (userData.accountType === 'admin') role = 'Администратор';
        if (userData.accountType === 'support') role = 'Техподдержка';

        if (userData.accountType === 'student' && userData.studentGroup) {
            return `${role}, ${userData.studentGroup}`;
        }

        return role;
    };

    if (loading) {
        return (
            <ListItem sx={{
                py: 2,
                px: 2,
                display: 'flex',
                justifyContent: 'center'
            }}>
                <Box sx={{
                    width: 96,
                    height: 96,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <CircularProgress size={40} />
                </Box>
            </ListItem>
        );
    }

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
                src={userData?.avatarUrl || ''}
                sx={{
                    width: 96,
                    height: 96,
                    mb: 2,
                    bgcolor: userData ? 'primary.main' : 'grey.500',
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
            <Typography variant="body2" color="text.secondary">
                {getRoleText()}
            </Typography>
        </ListItem>
    );
};

export default ProfileSection;
