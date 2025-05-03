import React, { useState, useEffect } from 'react';
import {
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    Box,
    CircularProgress,
    IconButton,
    Button
} from '@mui/material';
import { Send, ArrowBack } from '@mui/icons-material';
import { db, auth } from '@src/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import SearchBar from '@components/SearchBar';
import { createOrGetChat } from '@services/chatService';

const ACCOUNT_TYPES = {
    student: {
        label: 'Студент',
        getDescription: (user) => user.studentGroup ? `Студент, ${user.studentGroup}` : 'Студент'
    },
    teacher: {
        label: 'Преподаватель'
    },
    admin: {
        label: 'Администратор'
    },
    support: {
        label: 'Поддержка'
    }
};

export default function UsersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [autoFocusSearch, setAutoFocusSearch] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setAutoFocusSearch(true);
    }, []);

    useEffect(() => {
        const searchUsers = async () => {
            setLoading(true);
            try {
                let usersQuery;

                if (searchQuery.length === 0) {
                    usersQuery = query(
                        collection(db, 'users'),
                        where('fullName', '!=', ''),
                        limit(10)
                    );
                } else if (searchQuery.length === 1) {
                    setUsers([]);
                    setLoading(false);
                    return;
                } else {
                    usersQuery = query(
                        collection(db, 'users'),
                        where('fullName', '>=', searchQuery),
                        where('fullName', '<=', searchQuery + '\uf8ff'),
                        limit(10)
                    );
                }

                const snapshot = await getDocs(usersQuery);
                const usersData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).filter(user => user.id !== auth.currentUser?.uid);

                const filteredUsers = usersData.filter(user =>
                    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
                );
                setUsers(filteredUsers);
            } catch (error) {
                console.error("Error searching users:", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(searchUsers, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const createChat = async (userId) => {
        try {
            const chatId = await createOrGetChat(userId);
            navigate(`/chat/${chatId}`);
        } catch (error) {
            console.error("Error creating chat:", error);
            alert(error.message || 'Failed to start chat');
        }
    };

    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                p: 2
            }}
        >
            {/* Заголовок с кнопкой назад */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                    <ArrowBack color='primary' />
                </IconButton>
                <Typography variant="h6" fontWeight="bold">
                    Пользователи
                </Typography>
            </Box>

            <SearchBar
                placeholder="Поиск пользователей"
                value={searchQuery}
                onChange={setSearchQuery}
                autoFocus={autoFocusSearch}
            />

            {loading ? (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flex: 1
                }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <UserList
                        users={users}
                        onUserClick={createChat}
                        currentUserId={auth.currentUser?.uid}
                    />
                    {searchQuery.length === 1 && (
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            p: 2,
                            color: 'text.secondary',
                            flex: 1
                        }}>
                            <Typography variant="body2">
                                Введите минимум 2 символа для поиска
                            </Typography>
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}

const UserList = ({ users, onUserClick, currentUserId }) => {
    const navigate = useNavigate();

    const handleUserClick = (userId) => {
        navigate(`/user/${userId}`);
    };

    const handleChatButtonClick = (userId, e) => {
        e.stopPropagation();
        onUserClick(userId);
    };

    const getRoleDescription = (user) => {
        const accountType = user.accountType || 'student';
        const typeConfig = ACCOUNT_TYPES[accountType] || { label: accountType };

        if (typeof typeConfig.getDescription === 'function') {
            return typeConfig.getDescription(user);
        }
        return typeConfig.label;
    };

    if (users.length === 0) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                color: 'text.secondary'
            }}>
                <Typography variant="body1">Пользователи не найдены</Typography>
            </Box>
        );
    }

    return (
        <List sx={{ flex: 1, overflow: 'auto' }}>
            {users.map((user) => (
                <React.Fragment key={user.id}>
                    <ListItem
                        component="div"
                        onClick={() => handleUserClick(user.id)}
                        sx={{
                            px: 1,
                            borderRadius: 1,
                            '&:hover': { backgroundColor: 'action.hover' },
                            '&.Mui-selected, &:focus': { outline: 'none' },
                            backgroundColor: 'transparent',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <ListItemAvatar>
                                <Avatar src={user.avatarUrl} sx={{ bgcolor: 'primary.main' }}>
                                    {user.fullName?.charAt(0)}
                                </Avatar>
                            </ListItemAvatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography noWrap fontWeight="medium">
                                    {user.fullName}
                                </Typography>
                                <Typography noWrap variant="body2" color="text.secondary">
                                    {getRoleDescription(user)}
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton
                            onClick={(e) => handleChatButtonClick(user.id, e)}
                            size="medium"
                            sx={{
                                ml: 1,
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    color: 'primary.main'
                                }
                            }}
                        >
                            <Send fontSize="medium" color="primary" />
                        </IconButton>
                    </ListItem>
                </React.Fragment>
            ))}
        </List>
    );
};
