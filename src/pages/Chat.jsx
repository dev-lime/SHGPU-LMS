import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Avatar,
    Typography,
    TextField,
    IconButton,
    List,
    ListItem,
    CircularProgress,
    InputAdornment,
    Divider
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

    // Функция для проверки, нужно ли показывать аватар
    const shouldShowAvatar = (index) => {
        if (messages[index].sender === auth.currentUser?.uid) return false;
        if (index === messages.length - 1) return true;
        return messages[index].sender !== messages[index + 1].sender;
    };

    // Функция для проверки, нужно ли показывать время сообщения
    const shouldShowTime = (index) => {
        if (index === messages.length - 1) return true;

        const currentTime = messages[index].timestamp?.toDate();
        const nextTime = messages[index + 1].timestamp?.toDate();

        if (!currentTime || !nextTime) return true;

        // Показываем время если следующее сообщение от другого пользователя
        if (messages[index].sender !== messages[index + 1].sender) return true;

        // Или если разница во времени больше минуты
        return (nextTime.getTime() - currentTime.getTime()) > 60000;
    };

    // Функция для проверки смены дня
    const isNewDay = (index) => {
        if (index === 0) return true;

        const currentDate = messages[index].timestamp?.toDate();
        const prevDate = messages[index - 1].timestamp?.toDate();

        if (!currentDate || !prevDate) return false;

        return (
            currentDate.getDate() !== prevDate.getDate() ||
            currentDate.getMonth() !== prevDate.getMonth() ||
            currentDate.getFullYear() !== prevDate.getFullYear()
        );
    };

    // Форматирование даты для разделителя
    const formatDate = (date) => {
        if (!date) return '';
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('ru-RU', options);
    };

    // Отправка нового сообщения
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !chatId) return;

        try {
            await addDoc(collection(db, 'chats', chatId, 'messages'), {
                text: newMessage,
                sender: auth.currentUser.uid,
                timestamp: serverTimestamp()
            });

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
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default'
        }}>
            {/* Шапка чата */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1,
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
                    p: 1,
                    bgcolor: 'background.default',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <List sx={{ width: '100%' }}>
                    {messages.map((message, index) => {
                        const showDateDivider = isNewDay(index);
                        const messageDate = message.timestamp?.toDate();

                        return (
                            <React.Fragment key={message.id}>
                                {showDateDivider && (
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        my: 2,
                                        px: 1
                                    }}>
                                        <Divider sx={{ flex: 1 }} />
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                mx: 2,
                                                color: 'text.secondary'
                                            }}
                                        >
                                            {formatDate(messageDate)}
                                        </Typography>
                                        <Divider sx={{ flex: 1 }} />
                                    </Box>
                                )}

                                <ListItem
                                    sx={{
                                        justifyContent: message.sender === auth.currentUser?.uid ?
                                            'flex-end' : 'flex-start',
                                        px: 1,
                                        alignItems: 'flex-start',
                                        pt: 0.5,
                                        pb: 0.5
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
                                                    bgcolor: 'primary.main',
                                                    visibility: shouldShowAvatar(index) ? 'visible' : 'hidden'
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
                                            }}>
                                                <Typography>{message.text}</Typography>
                                            </Box>
                                            {shouldShowTime(index) && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: 'text.secondary',
                                                        px: 1,
                                                        mt: 0.5
                                                    }}
                                                >
                                                    {message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </ListItem>
                            </React.Fragment>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </List>
            </Box>

            {/* Поле ввода сообщения */}
            <Box sx={{
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                flexShrink: 0
            }}>
                <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Написать сообщение..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    multiline
                    maxRows={4}
                    sx={{
                        '& .MuiInput-root': {
                            px: 2,
                            py: 1
                        },
                        '& .MuiInput-root:before, & .MuiInput-root:after': {
                            display: 'none'
                        }
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    color="primary"
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                    sx={{
                                        '&.Mui-selected': { outline: 'none' },
                                        '&:focus': { outline: 'none' }
                                    }}
                                >
                                    <Send />
                                </IconButton>
                            </InputAdornment>
                        ),
                        disableUnderline: true
                    }}
                />
            </Box>
        </Box>
    );
}
