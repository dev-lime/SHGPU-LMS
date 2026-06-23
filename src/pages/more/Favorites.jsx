import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    IconButton,
    CircularProgress
} from '@mui/material';
import {
    BookmarkBorder,
    Delete,
    ArrowBack
} from '@mui/icons-material';
import { db, auth } from '@src/firebase';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Favorites() {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth.currentUser) {
            setLoading(false);
            return;
        }
        const q = query(
            collection(db, 'users', auth.currentUser.uid, 'favorites')
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            items.sort((a, b) => {
                const aTime = a.savedAt?.toDate?.()?.getTime() || 0;
                const bTime = b.savedAt?.toDate?.()?.getTime() || 0;
                return bTime - aTime;
            });
            setFavorites(items);
            setLoading(false);
        }, () => {
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleRemove = async (id) => {
        try {
            await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'favorites', id));
        } catch (error) {
            console.error("Error removing favorite:", error);
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
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                    <ArrowBack color="primary" />
                </IconButton>
                <Typography variant="h5" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                    Избранное
                </Typography>
            </Box>

            {favorites.length === 0 ? (
                <Box sx={{
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'center',
                    flex: 1, p: 4, color: 'text.secondary'
                }}>
                    <BookmarkBorder sx={{ fontSize: 64, mb: 2, opacity: 0.4 }} />
                    <Typography variant="h6" sx={{ textAlign: 'center' }}>Нет сохраненных элементов</Typography>
                    <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                        Добавляйте новости и сообщения в избранное, чтобы они появились здесь
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                    {favorites.map((item) => (
                        <Card
                            key={item.id}
                            sx={{ mb: 2, borderRadius: 3, cursor: 'pointer' }}
                            onClick={() => {
                                if (item.type === 'news' && item.link) {
                                    window.open(item.link, '_blank');
                                } else if (item.type === 'message' && item.chatId) {
                                    navigate(`/chat/${item.chatId}`, { state: { scrollToMessage: item.messageId } });
                                }
                            }}
                        >
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                                        {item.type === 'news' ? (
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                    {item.title}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    {item.category && (
                                                        <Chip label={item.category} size="small" variant="outlined"
                                                            sx={{ fontWeight: 500, borderColor: 'primary.main', color: 'primary.main' }}
                                                        />
                                                    )}
                                                    {item.date && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {item.date}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                {item.content && (
                                                    <Typography variant="body2" color="text.secondary"
                                                        sx={{
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 3,
                                                            WebkitBoxOrient: 'vertical',
                                                        }}
                                                    >
                                                        {item.content}
                                                    </Typography>
                                                )}
                                            </Box>
                                        ) : (
                                            <Box>
                                                <Typography variant="body1"
                                                    sx={{
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: 'vertical',
                                                        mb: 1,
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word'
                                                    }}
                                                >
                                                    {item.text}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {item.senderName || 'Неизвестно'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.disabled">·</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {item.chatName || 'Чат'}
                                                    </Typography>
                                                    {item.messageTimestamp && (
                                                        <>
                                                            <Typography variant="caption" color="text.disabled">·</Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {formatTimestamp(item.messageTimestamp)}
                                                            </Typography>
                                                        </>
                                                    )}
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>

                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove(item.id);
                                        }}
                                        sx={{ color: 'text.secondary', flexShrink: 0, mt: 0.5 }}
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Box>
    );
}

function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    let date;
    if (typeof timestamp === 'object' && timestamp.toDate) {
        date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
        date = timestamp;
    } else {
        return '';
    }
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
