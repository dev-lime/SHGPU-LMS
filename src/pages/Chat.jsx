import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Avatar,
    Typography,
    TextField,
    IconButton,
    List,
    ListItem,
    CircularProgress
} from '@mui/material';
import { Send, ArrowBack } from '@mui/icons-material';
import { db, auth } from '../firebase';
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    updateDoc
} from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';

export default function Chat() {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [chatInfo, setChatInfo] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    // Загрузка данных чата и сообщений
    useEffect(() => {
        const loadChatData = async () => {
            try {
                const chatDoc = await getDoc(doc(db, 'chats', chatId));
                if (!chatDoc.exists()) {
                    navigate('/messenger');
                    return;
                }

                const chatData = chatDoc.data();
                if (!chatData || !Array.isArray(chatData.participants)) {
                    console.error('Chat data is invalid:', chatData);
                    navigate('/messenger');
                    return;
                }
                setChatInfo(chatData);

                const otherUserId = chatData.participants.find(
                    id => id !== auth.currentUser?.uid
                );

                if (otherUserId) {
                    const userDoc = await getDoc(doc(db, 'users', otherUserId));
                    if (userDoc.exists()) {
                        setOtherUser({
                            id: userDoc.id,
                            ...userDoc.data()
                        });
                    }
                }

                const messagesQuery = query(
                    collection(db, 'chats', chatId, 'messages'),
                    orderBy('timestamp', 'asc')
                );

                const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
                    const messagesData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setMessages(messagesData);
                    setLoading(false);

                    setTimeout(() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                });

                return () => unsubscribe();
            } catch (error) {
                console.error("Error loading chat:", error);
                setLoading(false);
            }
        };

        loadChatData();
    }, [chatId, navigate]);

    // Автоматическая прокрутка при новом сообщении
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Отправка нового сообщения
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !chatId) return;

        try {
            // Добавляем сообщение в подколлекцию messages
            await addDoc(collection(db, 'chats', chatId, 'messages'), {
                text: newMessage,
                sender: auth.currentUser.uid,
                timestamp: serverTimestamp()
            });

            // Обновляем lastMessage в документе чата
            await updateDoc(doc(db, 'chats', chatId), {
                'lastMessage.text': newMessage,
                'lastMessage.sender': auth.currentUser.uid,
                'lastMessage.timestamp': serverTimestamp()
            });

            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Обработка нажатия Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default'
        }}>
            {/* Шапка чата */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                flexShrink: 0
            }}>
                <IconButton
                    onClick={() => navigate('/messenger')}
                    sx={{
                        mr: 1,
                        '&.Mui-selected': { outline: 'none' },
                        '&:focus': { outline: 'none' }
                    }}
                >
                    <ArrowBack color="primary" />
                </IconButton>

                {otherUser && (
                    <>
                        <Avatar
                            src={otherUser.avatarUrl}
                            sx={{
                                width: 40,
                                height: 40,
                                mr: 2,
                                bgcolor: 'primary.main'
                            }}
                        >
                            {otherUser.fullName?.charAt(0)}
                        </Avatar>
                        <Typography variant="h6">
                            {otherUser.fullName}
                        </Typography>
                    </>
                )}
            </Box>

            {/* Список сообщений */}
            <Box
                ref={messagesContainerRef}
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: 2,
                    bgcolor: 'background.default',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <List sx={{ width: '100%', flex: 1 }}>
                    {messages.map((message) => (
                        <ListItem
                            key={message.id}
                            sx={{
                                justifyContent: message.sender === auth.currentUser?.uid ?
                                    'flex-end' : 'flex-start',
                                px: 1,
                                alignItems: 'flex-start'
                            }}
                        >
                            <Box sx={{
                                maxWidth: '70%',
                                display: 'flex',
                                flexDirection: message.sender === auth.currentUser?.uid ?
                                    'row-reverse' : 'row',
                                alignItems: 'flex-end',
                                gap: 1
                            }}>
                                {message.sender !== auth.currentUser?.uid && (
                                    <Avatar
                                        src={otherUser?.avatarUrl}
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            bgcolor: 'primary.main'
                                        }}
                                    >
                                        {otherUser?.fullName?.charAt(0)}
                                    </Avatar>
                                )}

                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: message.sender === auth.currentUser?.uid ?
                                        'flex-end' : 'flex-start'
                                }}>
                                    <Box sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: message.sender === auth.currentUser?.uid ?
                                            'primary.main' : 'action.hover',
                                        color: message.sender === auth.currentUser?.uid ?
                                            'primary.contrastText' : 'text.primary',
                                        mb: 0.5
                                    }}>
                                        <Typography>{message.text}</Typography>
                                    </Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'text.secondary',
                                            px: 1
                                        }}
                                    >
                                        {message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </Box>
                            </Box>
                        </ListItem>
                    ))}
                    <div ref={messagesEndRef} />
                </List>
            </Box>

            {/* Поле ввода сообщения */}
            <Box sx={{
                p: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                flexShrink: 0
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Написать сообщение..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        multiline
                        maxRows={4}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '24px',
                                bgcolor: 'background.default'
                            }
                        }}
                    />
                    <IconButton
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                    >
                        <Send />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
}
