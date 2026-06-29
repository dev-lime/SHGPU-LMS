import React, { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
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
    DialogTitle,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Paper
} from '@mui/material';
import {
    Send,
    ArrowBack,
    MoreVert,
    ContentCopy,
    Delete,
    AttachFile,
    BookmarkBorder,
    Bookmark
} from '@mui/icons-material';
import { db, auth } from '@src/firebase';
import {
    doc,
    getDoc,
    collection,
    query,
    orderBy,
    addDoc,
    serverTimestamp,
    updateDoc,
    deleteDoc,
    setDoc,
    where
} from 'firebase/firestore';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { onSnapshot } from 'firebase/firestore';
import useDialog from '@hooks/useDialog';
import useSnackbar from '@hooks/useSnackbar';
import useScrollToBottom from '@hooks/useScrollToBottom';
import useMessageDisplay, {
    cleanMessageText,
    formatMessageDate,
    getUserRoleText
} from '@hooks/useMessageDisplay';

const ReactMarkdown = lazy(() => import('react-markdown'));
const AttachmentPanel = lazy(() => import('@components/AttachmentPanel'));
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

const DeleteConfirmationDialog = ({
    open,
    onClose,
    onConfirm,
    title,
    content,
    confirmText = "Удалить",
    cancelText = "Отмена"
}) => (
    <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
    >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-description">
                {content}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} sx={{ '&.Mui-selected, &:focus': { outline: 'none' } }}>
                {cancelText}
            </Button>
            <Button onClick={onConfirm} color="error" autoFocus
                sx={{ '&.Mui-selected, &:focus': { outline: 'none' } }}>
                {confirmText}
            </Button>
        </DialogActions>
    </Dialog>
);

const MessageItem = React.memo(({
    message,
    isOwnMessage,
    showAvatar,
    showTime,
    otherUser,
    isNewMessage,
    onCopy,
    onDelete,
    isBookmarked,
    onToggleBookmark
}) => {
    const navigate = useNavigate();
    const [showActions, setShowActions] = useState(false);
    const deleteDialog = useDialog();

    const timeString = useMemo(() => {
        try {
            if (!message?.timestamp?.toDate) return '';
            const date = message.timestamp.toDate();
            return date?.toLocaleTimeString?.([], { hour: '2-digit', minute: '2-digit' }) || '';
        } catch {
            return '';
        }
    }, [message.timestamp]);

    const handleCopy = () => onCopy(message.text);
    const handleToggleBookmark = () => onToggleBookmark(message);
    const handleDelete = () => deleteDialog.handleOpen();
    const handleDeleteConfirm = () => {
        onDelete(message.id);
        deleteDialog.handleClose();
    };

    return (
        <>
            <Grow in={true} timeout={isNewMessage ? 500 : 0}>
                <ListItem
                    id={`msg-${message.id}`}
                    sx={{
                        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                        px: 1, alignItems: 'flex-start',
                        pt: 0.5, pb: 0.5, position: 'relative'
                    }}
                    onMouseEnter={() => setShowActions(true)}
                    onMouseLeave={() => setShowActions(false)}
                >
                    <Box sx={{
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                        alignItems: 'flex-end', gap: 1, position: 'relative'
                    }}>
                        {!isOwnMessage && (
                            <Box sx={{
                                width: 32, height: 32, flexShrink: 0,
                                visibility: !showAvatar ? 'hidden' : 'visible'
                            }}>
                                {showAvatar && otherUser && (
                                    <IconButton
                                        onClick={() => navigate(`/user/${otherUser.id}`)}
                                        sx={{ p: 0 }}
                                    >
                                        <Avatar
                                            src={otherUser?.avatarUrl || ''}
                                            sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                                        >
                                            {otherUser?.fullName?.charAt?.(0) || ''}
                                        </Avatar>
                                    </IconButton>
                                )}
                            </Box>
                        )}

                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                            minWidth: 0, position: 'relative'
                        }}>
                            {showActions && (
                                <Box sx={{
                                    position: 'absolute', top: '0',
                                    ...(isOwnMessage ? { left: -100 } : { right: -70 }),
                                    display: 'flex', gap: 0.5,
                                    bgcolor: 'background.paper',
                                    borderRadius: 2, p: 0.5,
                                    boxShadow: 1, zIndex: 1
                                }}>
                                    <Tooltip title="Копировать">
                                        <IconButton size="small" onClick={handleCopy}>
                                            <ContentCopy fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={isBookmarked ? "Убрать из избранного" : "В избранное"}>
                                        <IconButton size="small" onClick={handleToggleBookmark}>
                                            {isBookmarked ? <Bookmark fontSize="small" color="primary" /> : <BookmarkBorder fontSize="small" />}
                                        </IconButton>
                                    </Tooltip>
                                    {isOwnMessage && (
                                        <Tooltip title="Удалить">
                                            <IconButton size="small" onClick={handleDelete}>
                                                <Delete fontSize="small" color="error" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                            )}

                            <Box sx={{
                                p: 1.5, borderRadius: 2,
                                bgcolor: isOwnMessage ? 'primary.main' : 'action.hover',
                                color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
                                '& p': { margin: 0, lineHeight: 1.5, wordBreak: 'break-word' },
                                '& pre': {
                                    backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                    borderRadius: '4px', padding: '8px', overflowX: 'auto',
                                    margin: '8px 0', maxWidth: '100%'
                                },
                                '& code': {
                                    fontFamily: 'monospace', whiteSpace: 'pre-wrap',
                                    backgroundColor: 'transparent', padding: '2px 4px', borderRadius: '3px'
                                },
                                '& blockquote': {
                                    borderLeft: '3px solid',
                                    borderColor: isOwnMessage ? 'primary.light' : 'text.secondary',
                                    paddingLeft: '12px', margin: '8px 0',
                                    color: isOwnMessage ? 'primary.light' : 'text.secondary',
                                    fontStyle: 'italic'
                                },
                                '& ul, & ol': { paddingLeft: '24px', margin: '8px 0' },
                                '& li': { marginBottom: '4px' },
                                '& table': {
                                    borderCollapse: 'collapse', width: '100%',
                                    margin: '8px 0', overflow: 'hidden', borderRadius: '4px'
                                },
                                '& th, & td': {
                                    border: '1px solid',
                                    borderColor: isOwnMessage ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                                    padding: '6px 12px', textAlign: 'left'
                                },
                                '& th': {
                                    backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                                },
                                '& a': {
                                    color: 'inherit', textDecoration: 'none',
                                    borderBottom: '1px solid',
                                    borderColor: isOwnMessage ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)',
                                    '&:hover': { borderColor: 'inherit', textDecoration: 'none' }
                                },
                                '& img': { maxWidth: '100%', borderRadius: '4px' },
                                '& h1, & h2, & h3, & h4, & h5, & h6': {
                                    margin: '16px 0 8px 0', lineHeight: 1.2
                                },
                                maxWidth: '100%', overflow: 'hidden'
                            }}>
                                <Suspense fallback={<div>Loading...</div>}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeHighlight]}
                                        components={{
                                             a: ({ children, ...rest }) => (
                                                <a {...rest} target="_blank" rel="noopener noreferrer">{children}</a>
                                            )
                                        }}
                                    >
                                        {message?.text || ''}
                                    </ReactMarkdown>
                                </Suspense>
                            </Box>

                            {showTime && timeString && (
                                <Fade in={true} timeout={1000}>
                                    <Typography variant="caption"
                                        sx={{ color: 'text.secondary', px: 1, mt: 0.5 }}>
                                        {timeString}
                                    </Typography>
                                </Fade>
                            )}
                        </Box>
                    </Box>
                </ListItem>
            </Grow>

            <DeleteConfirmationDialog
                open={deleteDialog.open}
                onClose={deleteDialog.handleClose}
                onConfirm={handleDeleteConfirm}
                title="Удалить сообщение?"
                content="Вы уверены, что хотите удалить это сообщение? Это действие нельзя отменить."
                confirmText="Удалить"
            />
        </>
    );
});

export default function Chat() {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const snackbar = useSnackbar();
    const chatDeleteDialog = useDialog();
    const { containerRef: messagesContainerRef, scrollToBottom } = useScrollToBottom();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [otherUser, setOtherUser] = useState(null);
    const [lastMessageId, setLastMessageId] = useState(null);
    const initialScrollDoneRef = useRef(false);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [isAttachmentPanelOpen, setIsAttachmentPanelOpen] = useState(false);
    const [bookmarkedMessages, setBookmarkedMessages] = useState({});
    const bookmarkedMessagesRef = useRef(bookmarkedMessages);
    useEffect(() => {
        bookmarkedMessagesRef.current = bookmarkedMessages;
    }, [bookmarkedMessages]);
    const scrollToMessageRef = useRef(location.state?.scrollToMessage || null);
    const cameFromFavoritesRef = useRef(!!location.state?.scrollToMessage);

    const { shouldShowAvatar, shouldShowTime, isNewDay } = useMessageDisplay(messages);

    const isValidChatId = useCallback((id) => {
        return id && typeof id === 'string' && id.trim().length > 0;
    }, []);

    const loadChatData = useCallback(async () => {
        if (!isValidChatId(chatId)) return null;

        try {
            const chatRef = doc(db, 'chats', chatId);
            const chatDoc = await getDoc(chatRef);

            if (!chatDoc.exists()) throw new Error("Chat not found");

            const chatData = chatDoc.data();
            if (!chatData?.participants || !Array.isArray(chatData.participants)) {
                throw new Error("Invalid chat data structure");
            }

            const otherUserId = chatData.participants.find(id => id !== auth.currentUser?.uid);
            if (otherUserId) {
                const userDoc = await getDoc(doc(db, 'users', otherUserId));
                if (userDoc.exists()) {
                    setOtherUser({ id: userDoc.id, ...userDoc.data() });
                }
            }

            return query(
                collection(db, 'chats', chatId, 'messages'),
                orderBy('timestamp', 'asc')
            );
        } catch (error) {
            console.error("Error loading chat:", error);
            snackbar.show(error.message || "Ошибка загрузки чата");
            setLoading(false);
            return null;
        }
    }, [chatId, isValidChatId, snackbar]);

    useEffect(() => {
        let unsubscribe = () => { };
        let isMounted = true;

        const initializeChat = async () => {
            if (!isValidChatId(chatId)) return;
            try {
                const messagesQuery = await loadChatData();
                if (messagesQuery) {
                    unsubscribe = onSnapshot(messagesQuery,
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
                            snackbar.show("Ошибка загрузки сообщений");
                            setLoading(false);
                        }
                    );
                }
            } catch {
                if (isMounted) setLoading(false);
            }
        };

        initializeChat();
        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [chatId, loadChatData, isValidChatId, snackbar]);

    useEffect(() => {
        if (location.state?.scrollToMessage) {
            window.history.replaceState({}, document.title);
        }
    }, [location.state?.scrollToMessage]);

    useEffect(() => {
        if (!scrollToMessageRef.current || messages.length === 0) return;
        const el = document.getElementById(`msg-${scrollToMessageRef.current}`);
        if (el) {
            el.scrollIntoView({ block: 'center' });
            scrollToMessageRef.current = null;
            cameFromFavoritesRef.current = false;
        }
    }, [messages]);

    useEffect(() => {
        if (messages.length > 0 && !initialScrollDoneRef.current) {
            if (cameFromFavoritesRef.current) return;
            scrollToBottom('auto');
            initialScrollDoneRef.current = true;
        }
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (messages.length > 0 && !cameFromFavoritesRef.current) {
            scrollToBottom('smooth');
        }
    }, [messages.length, scrollToBottom]);

    useEffect(() => {
        if (!auth.currentUser) return;
        const q = query(
            collection(db, 'users', auth.currentUser.uid, 'favorites'),
            where('type', '==', 'message')
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const map = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.messageId) map[data.messageId] = doc.id;
            });
            setBookmarkedMessages(map);
        });
        return unsubscribe;
    }, []);

    const handleCopyMessage = useCallback((text) => {
        navigator.clipboard.writeText(text).then(() => {
            snackbar.show('Сообщение скопировано', 'success');
        }).catch(() => {
            snackbar.show('Не удалось скопировать сообщение');
        });
    }, [snackbar]);

    const handleToggleBookmark = useCallback(async (message) => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const docId = 'msg_' + message.id;
        const ref = doc(db, 'users', uid, 'favorites', docId);
        if (bookmarkedMessagesRef.current[message.id]) {
            await deleteDoc(ref);
        } else {
            const senderName = message.sender === uid
                ? (auth.currentUser.displayName || 'Вы')
                : (otherUser?.fullName || 'Пользователь');
            await setDoc(ref, {
                type: 'message',
                messageId: message.id,
                chatId: chatId,
                text: message.text,
                senderId: message.sender,
                senderName: senderName,
                chatName: otherUser?.fullName || 'Пользователь',
                messageTimestamp: message.timestamp,
                savedAt: serverTimestamp()
            });
        }
    }, [chatId, otherUser]);

    const handleDeleteMessage = useCallback(async (messageId) => {
        try {
            const messageToDelete = messages.find(m => m.id === messageId);
            if (!messageToDelete || messageToDelete.sender !== auth.currentUser?.uid) {
                snackbar.show('Вы можете удалять только свои сообщения');
                return;
            }

            await deleteDoc(doc(db, 'chats', chatId, 'messages', messageId));

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
            snackbar.show(
                error.code === 'permission-denied'
                    ? 'Недостаточно прав для удаления сообщения'
                    : error.message || "Ошибка при удалении сообщения"
            );
        }
    }, [chatId, messages, snackbar]);

    const handleSendMessage = useCallback(async () => {
        const cleanedMessage = cleanMessageText(newMessage.trim());
        if (!cleanedMessage || !chatId || !isValidChatId(chatId)) return;

        try {
            await addDoc(collection(db, 'chats', chatId, 'messages'), {
                text: cleanedMessage,
                sender: auth.currentUser?.uid,
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
            snackbar.show(error.message || "Ошибка при отправке сообщения");
        }
    }, [newMessage, chatId, isValidChatId, snackbar]);

    const handleDeleteChat = async () => {
        try {
            await deleteDoc(doc(db, 'chats', chatId));
            navigate('/chats');
        } catch (error) {
            console.error("Error deleting chat:", error);
            snackbar.show(error.message || "Ошибка при удалении чата");
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
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={snackbar.hide}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={snackbar.hide} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <Slide direction="down" in={true} mountOnEnter unmountOnExit>
                <Box sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: '1px solid', borderColor: 'divider',
                    bgcolor: 'background.paper', flexShrink: 0
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <IconButton onClick={() => navigate('/chats')} sx={{ ml: 1, mr: 1 }}>
                            <ArrowBack color="primary" />
                        </IconButton>

                        {otherUser && (
                            <Button
                                onClick={() => navigate(`/user/${otherUser.id}`)}
                                startIcon={
                                    <Avatar src={otherUser.avatarUrl || ''}
                                        sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                                        {otherUser.fullName?.charAt?.(0) || ''}
                                    </Avatar>
                                }
                                sx={{
                                    textTransform: 'none', color: 'text.primary',
                                    '&:hover': { backgroundColor: 'action.hover' },
                                    flex: 1, minWidth: 0, textAlign: 'left',
                                    justifyContent: 'flex-start', py: 0.5
                                }}
                            >
                                <Box sx={{
                                    display: 'flex', flexDirection: 'column',
                                    minWidth: 0, width: '100%', gap: 0.2
                                }}>
                                    <Typography variant="h6" noWrap
                                        sx={{ textOverflow: 'ellipsis', overflow: 'hidden', lineHeight: 1.2 }}>
                                        {otherUser.fullName || 'Пользователь'}
                                    </Typography>
                                    {otherUser?.accountType && (
                                        <Typography variant="caption" color="text.secondary" noWrap
                                            sx={{ fontSize: '0.75rem', lineHeight: 1, textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                            {getUserRoleText(otherUser)}
                                        </Typography>
                                    )}
                                </Box>
                            </Button>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            aria-label="more options"
                            aria-controls={menuAnchorEl ? 'chat-menu' : undefined}
                            aria-haspopup="true"
                            onClick={(e) => setMenuAnchorEl(e.currentTarget)}
                            sx={{ color: 'text.primary', mr: 1 }}
                        >
                            <MoreVert />
                        </IconButton>
                    </Box>

                    <Menu
                        id="chat-menu"
                        anchorEl={menuAnchorEl}
                        open={!!menuAnchorEl}
                        onClose={() => setMenuAnchorEl(null)}
                    >
                        <MenuItem onClick={() => {
                            setMenuAnchorEl(null);
                            chatDeleteDialog.handleOpen();
                        }}>
                            <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
                            <ListItemText>Удалить чат</ListItemText>
                        </MenuItem>
                    </Menu>

                    <DeleteConfirmationDialog
                        open={chatDeleteDialog.open}
                        onClose={chatDeleteDialog.handleClose}
                        onConfirm={handleDeleteChat}
                        title="Удалить чат?"
                        content="Вы уверены, что хотите удалить этот чат? Это действие нельзя отменить."
                        confirmText="Удалить"
                    />
                </Box>
            </Slide>

            <Box
                ref={messagesContainerRef}
                sx={{
                    flex: 1, overflowY: 'auto', p: 1,
                    display: 'flex', flexDirection: 'column', overflowX: 'hidden'
                }}
            >
                <List sx={{ width: '100%' }}>
                    {messages.map((message, index) => {
                        const showDateDivider = isNewDay(index);
                        const messageDate = message.timestamp?.toDate?.();
                        const isOwnMessage = message.sender === auth.currentUser?.uid;

                        return (
                            <React.Fragment key={message.id || `msg-${index}`}>
                                {showDateDivider && (
                                    <Fade in={true}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', my: 2, px: 1 }}>
                                            <Divider sx={{ flex: 1 }} />
                                            <Typography variant="caption" sx={{ mx: 2, color: 'text.secondary' }}>
                                                {formatMessageDate(messageDate)}
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
                                    isNewMessage={message.id === lastMessageId}
                                    onCopy={handleCopyMessage}
                                    onDelete={handleDeleteMessage}
                                    isBookmarked={!!bookmarkedMessages[message.id]}
                                    onToggleBookmark={handleToggleBookmark}
                                />
                            </React.Fragment>
                        );
                    })}
                </List>
            </Box>

            <Slide direction="up" in={true} mountOnEnter unmountOnExit>
                <Box sx={{
                    borderTop: '1px solid', borderColor: 'divider',
                    bgcolor: 'background.paper', flexShrink: 0
                }}>
                    <TextField
                        fullWidth
                        variant="standard"
                        placeholder="Написать сообщение..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        multiline
                        maxRows={4}
                        sx={{
                            '& .MuiInput-root': { px: 2, py: 1 },
                            '& .MuiInput-root:before, & .MuiInput-root:after': { display: 'none' }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <IconButton onClick={() => setIsAttachmentPanelOpen(true)} edge="start">
                                        <AttachFile />
                                    </IconButton>
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton color="primary" onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}>
                                        <Send />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Suspense fallback={null}>
                        <AttachmentPanel
                            open={isAttachmentPanelOpen}
                            onClose={() => setIsAttachmentPanelOpen(false)}
                        />
                    </Suspense>

                    {isAttachmentPanelOpen && (
                        <Box
                            sx={{
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1200
                            }}
                            onClick={() => setIsAttachmentPanelOpen(false)}
                        />
                    )}
                </Box>
            </Slide>
        </Box>
    );
}
