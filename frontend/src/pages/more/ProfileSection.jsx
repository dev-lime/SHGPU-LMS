import React from 'react';
import { ListItem, Avatar, Typography, Box, CircularProgress } from '@mui/material';
import useProfile from '@hooks/useProfile';
import { useNavigate } from 'react-router-dom';

const ProfileSection = () => {
    const {
        userData,
        loading,
        getAccountTypeIcon,
        getAccountTypeLabel
    } = useProfile();

    const navigate = useNavigate();

    const handleProfileClick = () => {
        if (userData?.id) {
            navigate(`/user/${userData.id}`);
        }
    };

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

    // Получаем иконку для типа аккаунта
    const renderAccountTypeIcon = () => {
        if (!userData?.accountType) return null;
        const Icon = getAccountTypeIcon(userData.accountType);
        return React.cloneElement(Icon, {
            fontSize: 'small',
            sx: { mr: 0.5 }
        });
    };

    // Получаем текст роли и группы
    const getRoleText = () => {
        if (!userData) return 'Гостевой режим';

        const role = getAccountTypeLabel(userData.accountType);

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
            onClick={handleProfileClick}
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
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {renderAccountTypeIcon()}
                <Typography variant="body2" color="text.secondary">
                    {getRoleText()}
                </Typography>
            </Box>
        </ListItem>
    );
};

export default ProfileSection;
