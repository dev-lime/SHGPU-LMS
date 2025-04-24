import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
    Divider,
    Grow,
    Fade,
    Slide
} from '@mui/material';
import { Send, ArrowBack } from '@mui/icons-material';
import { db, auth } from '../../firebase';
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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

// Оптимизированный компонент для отображения сообщений
const MessageItem = React.memo(({
    message,
    isOwnMessage,
    showAvatar,
    showTime,
    otherUser,
    isNewMessage
}) => {
    const timeString = useMemo(() => {
        return message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, [message.timestamp]);

    return (
        <Grow
            in={true}
            style={{ transformOrigin: isOwnMessage ? 'right top' : 'left top' }}
            timeout={isNewMessage ? 500 : 0}
        >
            <ListItem
                sx={{
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                    px: 1,
                    alignItems: 'flex-start',
                    pt: 0.5,
                    pb: 0.5
                }}
            >
                <Box sx={{
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    gap: 1
                }}>
                    {!isOwnMessage && showAvatar && (
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
                        alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
                    }}>
                        <Box sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: isOwnMessage ? 'primary.main' : 'action.hover',
                            color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
                            '& p': { margin: 0, lineHeight: 1.5 },
                            '& pre': {
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                borderRadius: '4px',
                                padding: '8px',
                                overflowX: 'auto',
                                margin: '8px 0'
                            },
                            '& code': { fontFamily: 'monospace' }
                        }}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeHighlight]}
                                components={{
                                    // Упрощенные компоненты для оптимизации
                                    p: ({ node, ...props }) => <p {...props} />,
                                    pre: ({ node, ...props }) => <pre {...props} />,
                                    code: ({ node, ...props }) => <code {...props} />
                                }}
                            >
                                {message.text}
                            </ReactMarkdown>
                        </Box>
                        {showTime && (
                            <Fade in={true} timeout={1000}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'text.secondary',
                                        px: 1,
                                        mt: 0.5
                                    }}
                                >
                                    {timeString}
                                </Typography>
                            </Fade>
                        )}
                    </Box>
                </Box>
            </ListItem>
        </Grow>
    );
});

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
    const [lastMessageId, setLastMessageId] = useState(null);

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

                    if (messagesData.length > 0) {
                        const lastMsg = messagesData[messagesData.length - 1];
                        if (lastMsg.id !== lastMessageId) {
                            setLastMessageId(lastMsg.id);
                        }
                    }
                });

                return () => unsubscribe();
            } catch (error) {
                console.error("Error loading chat:", error);
                setLoading(false);
            }
        };

        loadChatData();
    }, [chatId, navigate, lastMessageId]);

    // Автоматическая прокрутка при новом сообщении
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Оптимизированные функции проверок
    const shouldShowAvatar = useCallback((index) => {
        if (messages[index].sender === auth.currentUser?.uid) return false;
        if (index === messages.length - 1) return true;
        return messages[index].sender !== messages[index + 1].sender;
    }, [messages]);

    const shouldShowTime = useCallback((index) => {
        if (index === messages.length - 1) return true;

        const currentTime = messages[index].timestamp?.toDate();
        const nextTime = messages[index + 1].timestamp?.toDate();

        if (!currentTime || !nextTime) return true;
        if (messages[index].sender !== messages[index + 1].sender) return true;
        return (nextTime.getTime() - currentTime.getTime()) > 60000;
    }, [messages]);

    const isNewDay = useCallback((index) => {
        if (index === 0) return true;

        const currentDate = messages[index].timestamp?.toDate();
        const prevDate = messages[index - 1].timestamp?.toDate();

        if (!currentDate || !prevDate) return false;
        return (
            currentDate.getDate() !== prevDate.getDate() ||
            currentDate.getMonth() !== prevDate.getMonth() ||
            currentDate.getFullYear() !== prevDate.getFullYear()
        );
    }, [messages]);

    const formatDate = useCallback((date) => {
        if (!date) return '';
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('ru-RU', options);
    }, []);

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
            <Slide direction="down" in={true} mountOnEnter unmountOnExit>
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
            </Slide>

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
                        const isNewMessage = message.id === lastMessageId;
                        const isOwnMessage = message.sender === auth.currentUser?.uid;

                        return (
                            <React.Fragment key={message.id}>
                                {showDateDivider && (
                                    <Fade in={true}>
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
                                    </Fade>
                                )}

                                <MessageItem
                                    message={message}
                                    isOwnMessage={isOwnMessage}
                                    showAvatar={!isOwnMessage && shouldShowAvatar(index)}
                                    showTime={shouldShowTime(index)}
                                    otherUser={otherUser}
                                    isNewMessage={isNewMessage}
                                />
                            </React.Fragment>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </List>
            </Box>

            {/* Поле ввода сообщения */}
            <Slide direction="up" in={true} mountOnEnter unmountOnExit>
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
            </Slide>
        </Box>
    );
}
