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
    Alert
} from '@mui/material';
import { Send, ArrowBack } from '@mui/icons-material';
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
    updateDoc
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
    isNewMessage
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

    return (
        <Grow in={true} timeout={isNewMessage ? 500 : 0}>
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
                    {!isOwnMessage && showAvatar && otherUser && (
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

    // Optimized message sending
    const handleSendMessage = useCallback(async () => {
        if (!newMessage.trim() || !chatId || !isValidChatId(chatId)) return;

        try {
            const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), {
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
            setError(error.message || "Error sending message");
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
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={handleCloseError}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>

            {/* Chat header */}
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
                                src={otherUser.avatarUrl || ''}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    mr: 2,
                                    bgcolor: 'primary.main'
                                }}
                            >
                                {otherUser.fullName?.charAt?.(0) || ''}
                            </Avatar>
                            <Typography variant="h6">
                                {otherUser.fullName || 'Unknown User'}
                            </Typography>
                        </>
                    )}
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
                    flexDirection: 'column'
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
