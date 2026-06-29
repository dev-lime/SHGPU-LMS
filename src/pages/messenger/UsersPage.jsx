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
import { formatName, getInitials } from '@utils/formatName';

const ACCOUNT_TYPES = {
    student: {
        label: 'Студент',
        getDescription: (user) => user.studentGroup ? `Студент, ${user.studentGroup}` : 'Студент'
    },
    teacher: {
        label: 'Преподаватель'
    },
    employee: {
        label: 'Сотрудник'
    },
    admin: {
        label: 'Администратор'
    }
};

export default function UsersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [autoFocusSearch] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const searchUsers = async () => {
            setLoading(true);
            try {
                let usersQuery;

                if (searchQuery.length === 0) {
                    usersQuery = query(
                        collection(db, 'users'),
                        where('lastName', '!=', ''),
                        limit(10)
                    );
                } else if (searchQuery.length === 1) {
                    setUsers([]);
                    setLoading(false);
                    return;
                } else {
                    usersQuery = query(
                        collection(db, 'users'),
                        where('lastName', '>=', searchQuery),
                        where('lastName', '<=', searchQuery + '\uf8ff'),
                        limit(10)
                    );
                }

                const snapshot = await getDocs(usersQuery);
                const usersData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).filter(user => user.id !== auth.currentUser?.uid);

                const displayName = (user) => formatName(user).toLowerCase();
                const filteredUsers = usersData.filter(user =>
                    displayName(user).includes(searchQuery.toLowerCase())
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
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden',
                p: 3,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1, color: 'primary.main' }}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Пользователи
                </Typography>
            </Box>
            <SearchBar
                placeholder="Поиск пользователей..."
                value={searchQuery}
                onChange={setSearchQuery}
                autoFocus={autoFocusSearch}
                sx={{ mb: 3 }}
            />
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 5 }}>
                    <CircularProgress />
                </Box>
            ) : users.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 5 }}>
                    <Typography variant="body1" color="text.secondary">
                        Пользователи не найдены
                    </Typography>
                </Box>
            ) : (
                <List sx={{ flex: 1, overflowY: 'auto' }}>
                    {users.map((user) => {
                        const accountType = user.accountType || 'student';
                        const typeConfig = ACCOUNT_TYPES[accountType] || { label: accountType };
                        return (
                            <ListItem
                                key={user.id}
                                sx={{
                                    borderRadius: 2,
                                    mb: 0.5,
                                    '&:hover': {
                                        backgroundColor: 'action.hover',
                                    },
                                }}
                                secondaryAction={
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<Send />}
                                        onClick={() => createChat(user.id)}
                                        sx={{
                                            borderRadius: '50px',
                                            textTransform: 'none',
                                            px: 2,
                                            fontWeight: 500,
                                            fontSize: '0.8rem',
                                        }}
                                    >
                                        Написать
                                    </Button>
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar src={user.avatarUrl} sx={{ bgcolor: 'primary.main' }}>
                                        {getInitials(user)}
                                    </Avatar>
                                </ListItemAvatar>
                                <Box sx={{ ml: 1.5 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.3 }}>
                                        {formatName(user)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                                        {typeConfig.getDescription ? typeConfig.getDescription(user) : typeConfig.label}
                                    </Typography>
                                </Box>
                            </ListItem>
                        );
                    })}
                </List>
            )}
        </Box>
    );
}
