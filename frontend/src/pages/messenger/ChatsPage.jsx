import React, { useState, useEffect } from 'react';
import {
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    Badge,
    Box,
    CircularProgress,
    Fab
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { db, auth } from '@src/firebase';
import { collection, query, where, getDocs, doc, orderBy, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import SearchBar from '@components/SearchBar';

export default function ChatsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Загрузка чатов
    useEffect(() => {
        const loadChats = async () => {
            try {
                const q = query(
                    collection(db, 'chats'),
                    where('participants', 'array-contains', auth.currentUser?.uid),
                    orderBy('lastMessage.timestamp', 'desc')
                );

                const snapshot = await getDocs(q);
                const chatsData = await Promise.all(
                    snapshot.docs.map(async (document) => {
                        const chatData = document.data();
                        const otherParticipantId = chatData.participants.find(
                            id => id !== auth.currentUser?.uid
                        );

                        let participantName = chatData.participantNames || 'Unknown';
                        let participantPhoto = '';

                        if (otherParticipantId) {
                            const userDocRef = doc(db, 'users', otherParticipantId);
                            const userDoc = await getDoc(userDocRef);
                            if (userDoc.exists()) {
                                const userData = userDoc.data();
                                participantName = userData.fullName || userData.email;
                                participantPhoto = userData.avatarUrl || '';
                            }
                        }

                        return {
                            id: document.id,
                            ...chatData,
                            participantName,
                            participantPhoto
                        };
                    })
                );

                setChats(chatsData);
            } catch (error) {
                console.error("Error loading chats:", error);
            } finally {
                setLoading(false);
            }
        };

        loadChats();
    }, []);

    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                position: 'relative'
            }}
        >
            {/* Заголовок и поиск */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}>
                <Typography variant="h6" fontWeight="bold">
                    Чаты
                </Typography>

                <SearchBar
                    placeholder="Поиск чатов"
                    value={searchQuery}
                    onChange={setSearchQuery}
                />
            </Box>

            {/* Список чатов */}
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
                <ChatList
                    chats={chats.filter(chat =>
                        chat.participantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        chat.lastMessage?.text.toLowerCase().includes(searchQuery.toLowerCase())
                    )}
                    onChatClick={(id) => navigate(`/chat/${id}`)}
                />
            )}

            <Fab
                color="primary"
                aria-label="Написать"
                sx={{
                    position: 'fixed',
                    bottom: 80,
                    right: 16,
                    zIndex: 1
                }}
                onClick={() => navigate('/users', { state: { autoFocusSearch: true } })}
            >
                <EditIcon />
            </Fab>
        </Box>
    );
}

const ChatList = ({ chats, onChatClick }) => {
    const navigate = useNavigate();

    const handleAvatarClick = (userId, e) => {
        e.stopPropagation();
        navigate(`/user/${userId}`);
    };

    if (chats.length === 0) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                color: 'text.secondary'
            }}>
                <Typography variant="body1">Чатов не найдено</Typography>
            </Box>
        );
    }

    return (
        <List sx={{ flex: 1, overflow: 'auto' }}>
            {chats.map((chat) => {
                const otherParticipantId = chat.participants.find(id => id !== auth.currentUser?.uid);
                const isCurrentUserSender = chat.lastMessage?.sender === auth.currentUser?.uid;

                return (
                    <React.Fragment key={chat.id}>
                        <ListItem
                            component="div"
                            onClick={() => onChatClick(chat.id)}
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
                            <ListItemAvatar>
                                <Avatar
                                    src={chat.participantPhoto}
                                    sx={{
                                        bgcolor: 'primary.main',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            transform: 'scale(1.1)',
                                            transition: 'transform 0.2s'
                                        }
                                    }}
                                    onClick={(e) => handleAvatarClick(otherParticipantId, e)}
                                >
                                    {chat.participantName?.charAt(0)}
                                </Avatar>
                            </ListItemAvatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography
                                        noWrap
                                        fontWeight="medium"
                                        sx={{
                                            color: 'text.primary'
                                        }}
                                    >
                                        {chat.participantName}
                                    </Typography>
                                    {chat.lastMessage?.timestamp && (
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDate(chat.lastMessage.timestamp)}
                                        </Typography>
                                    )}
                                </Box>
                                <Typography
                                    noWrap
                                    variant="body2"
                                    color='text.secondary'
                                    sx={{
                                        fontStyle: isCurrentUserSender ? 'italic' : 'normal'
                                    }}
                                >
                                    {isCurrentUserSender ? 'Вы: ' : ''}
                                    {chat.lastMessage?.text}
                                </Typography>
                            </Box>
                            {chat.unreadCount > 0 && (
                                <Badge badgeContent={chat.unreadCount} color="primary" />
                            )}
                        </ListItem>
                    </React.Fragment>
                );
            })}
        </List>
    );
};

const formatDate = (timestamp) => {
    if (!timestamp) return '';

    let date;

    if (typeof timestamp === 'object' && timestamp.toDate) {
        date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
        date = timestamp;
    } else {
        date = new Date(timestamp);
        if (isNaN(date.getTime())) return '';
    }

    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};
