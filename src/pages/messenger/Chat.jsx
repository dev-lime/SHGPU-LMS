import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
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
    Slide,
    Snackbar,
    Alert,
    Button,
    Tooltip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import { Send, ArrowBack, MoreVert, ContentCopy, Delete } from '@mui/icons-material';
import { db, auth } from '../../firebase';
import {
    doc,
    getDoc,
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// Lazy load ReactMarkdown but not plugins (they need to be imported normally)
const ReactMarkdown = lazy(() => import('react-markdown'));
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

const MessageItem = React.memo(({
    message,
    isOwnMessage,
    showAvatar,
    showTime,
    otherUser,
    isNewMessage,
    onCopy,
    onDelete
}) => {
    const timeString = useMemo(() => {
        try {
            if (!message?.timestamp?.toDate) return '';
            const date = message.timestamp.toDate();
            return date?.toLocaleTimeString?.([], { hour: '2-digit', minute: '2-digit' }) || '';
        } catch (e) {
            console.error("Error formatting time:", e);
            return '';
        }
    }, [message.timestamp]);

    const [showActions, setShowActions] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const handleCopy = () => {
        onCopy(message.text);
    };

    const handleDeleteClick = () => {
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = () => {
        onDelete(message.id);
        setDeleteConfirmOpen(false);
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
    };

    return (
        <>
            <Grow in={true} timeout={isNewMessage ? 500 : 0}>
                <ListItem
                    sx={{
                        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                        px: 1,
                        alignItems: 'flex-start',
                        pt: 0.5,
                        pb: 0.5,
                        position: 'relative'
                    }}
                    onMouseEnter={() => setShowActions(true)}
                    onMouseLeave={() => setShowActions(false)}
                >
                    <Box sx={{
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                        alignItems: 'flex-end',
                        gap: 1
                    }}>
                        {/* Аватарка или пустой отступ - только для получателя */}
                        {!isOwnMessage && (
                            <Box sx={{
                                width: 32,
                                height: 32,
                                flexShrink: 0,
                                visibility: !showAvatar ? 'hidden' : 'visible'
                            }}>
                                {showAvatar && otherUser && (
                                    <IconButton
                                        onClick={() => console.log("Clicked user:", otherUser.fullName || 'Unknown User')}
                                        sx={{ p: 0 }}
                                    >
                                        <Avatar
                                            src={otherUser?.avatarUrl || ''}
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                bgcolor: 'primary.main'
                                            }}
                                        >
                                            {otherUser?.fullName?.charAt?.(0) || ''}
                                        </Avatar>
                                    </IconButton>
                                )}
                            </Box>
                        )}

                        {/* Кнопки действий */}
                        {showActions && (
                            <Box sx={{
                                position: 'absolute',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                ...(isOwnMessage ? { left: -2 } : { right: -2 }),
                                display: 'flex',
                                gap: 0.5,
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                p: 0.5,
                                boxShadow: 1,
                                zIndex: 1
                            }}>
                                <Tooltip title="Копировать">
                                    <IconButton size="small" onClick={handleCopy}>
                                        <ContentCopy fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                {isOwnMessage && (
                                    <Tooltip title="Удалить">
                                        <IconButton size="small" onClick={handleDeleteClick}>
                                            <Delete fontSize="small" color="error" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                        )}

                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                            minWidth: 0
                        }}>
                            <Box sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: isOwnMessage ? 'primary.main' : 'action.hover',
                                color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
                                '& p': {
                                    margin: 0,
                                    lineHeight: 1.5,
                                    wordBreak: 'break-word'
                                },
                                '& pre': {
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                    borderRadius: '4px',
                                    padding: '8px',
                                    overflowX: 'auto',
                                    margin: '8px 0',
                                    maxWidth: '100%'
                                },
                                '& code': {
                                    fontFamily: 'monospace',
                                    whiteSpace: 'pre-wrap'
                                },
                                maxWidth: '100%',
                                overflow: 'hidden'
                            }}>
                                <Suspense fallback={<div>Loading...</div>}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeHighlight]}
                                        components={{
                                            p: ({ node, ...props }) => <p {...props} />,
                                            pre: ({ node, ...props }) => <pre {...props} />,
                                            code: ({ node, ...props }) => <code {...props} />
                                        }}
                                    >
                                        {message?.text || ''}
                                    </ReactMarkdown>
                                </Suspense>
                            </Box>
                            {showTime && timeString && (
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

            {/* Диалог подтверждения удаления */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={handleDeleteCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Удалить сообщение?</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Вы уверены, что хотите удалить это сообщение? Это действие нельзя отменить.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        sx={{ '&.Mui-selected, &:focus': { outline: 'none' } }}
                        onClick={handleDeleteCancel}>
                        Отмена
                    </Button>
                    <Button
                        sx={{ '&.Mui-selected, &:focus': { outline: 'none' } }}
                        onClick={handleDeleteConfirm} color="error" autoFocus>
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
});

export default function Chat() {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [chatInfo, setChatInfo] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [lastMessageId, setLastMessageId] = useState(null);
    const [initialScrollDone, setInitialScrollDone] = useState(false);

    // Фильтрация специальных символов
    const cleanMessageText = (text) => {
        // Удаляем управляющие символы (кроме переноса строки и табуляции)
        return text.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '');
    };

    const isValidChatId = useCallback((id) => {
        return id && typeof id === 'string' && id.trim().length > 0;
    }, []);

    // Scroll to bottom function
    const scrollToBottom = useCallback((behavior = 'auto') => {
        const scrollContainer = messagesContainerRef.current;
        if (scrollContainer) {
            scrollContainer.scrollTo({
                top: scrollContainer.scrollHeight,
                behavior: behavior
            });
        }
    }, []);

    // Memoized chat data loading
    const loadChatData = useCallback(async () => {
        if (!isValidChatId(chatId)) return;

        try {
            const chatRef = doc(db, 'chats', chatId);
            const chatDoc = await getDoc(chatRef);

            if (!chatDoc.exists()) {
                throw new Error("Chat not found");
            }

            const chatData = chatDoc.data();
            if (!chatData?.participants || !Array.isArray(chatData.participants)) {
                throw new Error("Invalid chat data structure");
            }

            setChatInfo(chatData);

            const otherUserId = chatData.participants.find(
                id => id !== auth.currentUser?.uid
            );

            if (otherUserId) {
                const userRef = doc(db, 'users', otherUserId);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    setOtherUser({
                        id: userDoc.id,
                        ...userDoc.data()
                    });
                }
            }

            return query(
                collection(db, 'chats', chatId, 'messages'),
                orderBy('timestamp', 'asc')
            );
        } catch (error) {
            console.error("Error loading chat:", error);
            setError(error.message || "Error loading chat data");
            setLoading(false);
            return null;
        }
    }, [chatId, isValidChatId]);

    // Load messages with memoized callback
    const loadMessages = useCallback((messagesQuery) => {
        return onSnapshot(messagesQuery,
            (snapshot) => {
                const messagesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMessages(messagesData);
                setLoading(false);

                if (messagesData.length > 0) {
                    setLastMessageId(messagesData[messagesData.length - 1].id);
                }
            },
            (error) => {
                console.error("Error in messages subscription:", error);
                setError("Error loading messages");
                setLoading(false);
            }
        );
    }, []);

    // Combined data loading effect
    useEffect(() => {
        let unsubscribe = () => { };
        let isMounted = true;

        const initializeChat = async () => {
            if (!isValidChatId(chatId) || !location.pathname.startsWith('/chat/')) return;

            try {
                const messagesQuery = await loadChatData();
                if (messagesQuery) {
                    unsubscribe = loadMessages(messagesQuery);
                }
            } catch (error) {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        initializeChat();

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [chatId, loadChatData, loadMessages, location.pathname, isValidChatId]);

    // Initial scroll to bottom when messages first load
    useEffect(() => {
        if (messages.length > 0 && !initialScrollDone) {
            scrollToBottom();
            setInitialScrollDone(true);
        }
    }, [messages, initialScrollDone, scrollToBottom]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom('smooth');
        }
    }, [messages.length, scrollToBottom]);

    // Memoized message display logic
    const shouldShowAvatar = useCallback((index) => {
        if (!messages[index] || messages[index].sender === auth.currentUser?.uid) return false;
        if (index === messages.length - 1) return true;
        return messages[index].sender !== messages[index + 1]?.sender;
    }, [messages]);

    const shouldShowTime = useCallback((index) => {
        if (index === messages.length - 1) return true;
        if (!messages[index]?.timestamp || !messages[index + 1]?.timestamp) return true;

        try {
            const currentTime = messages[index].timestamp.toDate();
            const nextTime = messages[index + 1].timestamp.toDate();
            return (messages[index].sender !== messages[index + 1].sender) ||
                (nextTime.getTime() - currentTime.getTime()) > 60000;
        } catch {
            return true;
        }
    }, [messages]);

    const isNewDay = useCallback((index) => {
        if (index === 0) return true;
        if (!messages[index]?.timestamp || !messages[index - 1]?.timestamp) return false;

        try {
            const currentDate = messages[index].timestamp.toDate();
            const prevDate = messages[index - 1].timestamp.toDate();
            return currentDate.toDateString() !== prevDate.toDateString();
        } catch {
            return false;
        }
    }, [messages]);

    const formatDate = useCallback((date) => {
        if (!date) return '';
        try {
            return date.toLocaleDateString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return '';
        }
    }, []);

    const handleCopyMessage = useCallback((text) => {
        navigator.clipboard.writeText(text).then(() => {
            setError('Сообщение скопировано');
            setTimeout(() => setError(null), 2000);
        }).catch(err => {
            setError('Не удалось скопировать сообщение');
        });
    }, []);

    const handleDeleteMessage = useCallback(async (messageId) => {
        try {
            // Проверяем, что сообщение принадлежит текущему пользователю
            const messageToDelete = messages.find(m => m.id === messageId);
            if (!messageToDelete || messageToDelete.sender !== auth.currentUser?.uid) {
                setError('Вы можете удалять только свои сообщения');
                return;
            }

            await deleteDoc(doc(db, 'chats', chatId, 'messages', messageId));

            // Обновляем последнее сообщение в чате, если нужно
            if (messages.length > 0 && messages[messages.length - 1].id === messageId) {
                const newLastMessage = messages.length > 1 ? messages[messages.length - 2] : null;
                await updateDoc(doc(db, 'chats', chatId), {
                    'lastMessage': newLastMessage ? {
                        text: newLastMessage.text,
                        sender: newLastMessage.sender,
                        timestamp: newLastMessage.timestamp
                    } : null
                });
            }
        } catch (error) {
            console.error("Error deleting message:", error);
            if (error.code === 'permission-denied') {
                setError('Недостаточно прав для удаления сообщения');
            } else {
                setError(error.message || "Ошибка при удалении сообщения");
            }
        }
    }, [chatId, messages]);

    // Optimized message sending
    const handleSendMessage = useCallback(async () => {
        const cleanedMessage = cleanMessageText(newMessage.trim());
        if (!cleanedMessage || !chatId || !isValidChatId(chatId)) return;

        try {
            const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), {
                text: cleanedMessage,
                sender: auth.currentUser.uid,
                timestamp: serverTimestamp()
            });

            await updateDoc(doc(db, 'chats', chatId), {
                'lastMessage.text': cleanedMessage,
                'lastMessage.sender': auth.currentUser.uid,
                'lastMessage.timestamp': serverTimestamp()
            });

            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            setError(error.message || "Ошибка при отправке сообщения");
        }
    }, [newMessage, chatId, isValidChatId]);

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }, [handleSendMessage]);

    const handleCloseError = useCallback(() => {
        setError(null);
    }, []);

    const handleUserClick = useCallback(() => {
        if (otherUser) {
            console.log("Clicked user:", otherUser.fullName || 'Unknown User');
        }
    }, [otherUser]);

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
            bgcolor: 'background.default',
            overflow: 'hidden'
        }}>
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={handleCloseError}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseError} severity={error === 'Сообщение скопировано' ? 'success' : 'error'} sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>

            {/* Chat header */}
            <Slide direction="down" in={true} mountOnEnter unmountOnExit>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    flexShrink: 0
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            onClick={() => navigate('/messenger')}
                            sx={{ ml: 1, mr: 1 }}
                        >
                            <ArrowBack color="primary" />
                        </IconButton>

                        {otherUser && (
                            <Button
                                onClick={handleUserClick}
                                startIcon={
                                    <Avatar
                                        src={otherUser.avatarUrl || ''}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            bgcolor: 'primary.main'
                                        }}
                                    >
                                        {otherUser.fullName?.charAt?.(0) || ''}
                                    </Avatar>
                                }
                                sx={{
                                    textTransform: 'none',
                                    color: 'text.primary',
                                    '&:hover': { backgroundColor: 'action.hover' },
                                    '&.Mui-selected, &:focus': { outline: 'none' }
                                }}
                            >
                                <Typography variant="h6">
                                    {otherUser.fullName || 'Unknown User'}
                                </Typography>
                            </Button>
                        )}
                    </Box>

                    {/* Кнопка с тремя точками */}
                    <IconButton
                        aria-label="more options"
                        sx={{ color: 'text.primary', mr: 1 }}
                    >
                        <MoreVert />
                    </IconButton>
                </Box>
            </Slide>

            {/* Messages list */}
            <Box
                ref={messagesContainerRef}
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: 1,
                    bgcolor: 'background.default',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowX: 'hidden'
                }}
            >
                <List sx={{ width: '100%' }}>
                    {messages.map((message, index) => {
                        const showDateDivider = isNewDay(index);
                        const messageDate = message.timestamp?.toDate?.();
                        const isNewMessage = message.id === lastMessageId;
                        const isOwnMessage = message.sender === auth.currentUser?.uid;

                        return (
                            <React.Fragment key={message.id || `msg-${index}`}>
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
                                    onCopy={handleCopyMessage}
                                    onDelete={handleDeleteMessage}
                                />
                            </React.Fragment>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </List>
            </Box>

            {/* Message input */}
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
