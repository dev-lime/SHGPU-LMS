import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Divider,
    Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate } from 'react-router-dom';
import SearchBar from '@components/SearchBar';
import docsData from './documents.json';

export default function Documents() {
    const navigate = useNavigate();
    const [docs, setDocs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadedDocs = docsData.map(doc => ({
            ...doc,
            uploadDate: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
        }));
        setDocs(loadedDocs);
    }, []);

    const handleDownload = (url, name) => {
        console.log('Downloading:', url);
        const link = document.createElement('a');
        link.href = url;
        link.download = name + '.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const filteredDocs = docs.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            p: 2
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{ mr: 1 }}
                    >
                        <ArrowBackIcon color="primary" />
                    </IconButton>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Документы
                    </Typography>
                </Box>

                <SearchBar
                    placeholder="Поиск"
                    value={searchQuery}
                    onChange={setSearchQuery}
                    width="50%"
                />
            </Box>

            <Paper elevation={0} sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider'
            }}>
                <List disablePadding>
                    {filteredDocs.map((doc, index) => (
                        <React.Fragment key={index}>
                            <ListItem
                                sx={{
                                    py: 2,
                                    px: 2,
                                    alignItems: 'flex-start',
                                    '&:hover': {
                                        backgroundColor: 'action.hover'
                                    }
                                }}
                            >
                                <Box sx={{ mr: 2, flexGrow: 1 }}>
                                    <Typography component="div" variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5 }}>
                                        {doc.name}
                                    </Typography>
                                    <Typography
                                        component="div"
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            wordBreak: 'break-word',
                                            pr: 4,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}
                                    >
                                        {doc.description}
                                    </Typography>
                                    <Typography
                                        component="div"
                                        variant="caption"
                                        color="text.disabled"
                                        sx={{ display: 'block', mt: 0.5 }}
                                    >
                                        Загружено: {formatDate(doc.uploadDate)}
                                    </Typography>
                                </Box>

                                <ListItemSecondaryAction sx={{
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    mx: 1
                                }}>
                                    <Tooltip title="Скачать" arrow>
                                        <IconButton
                                            edge="end"
                                            aria-label="download"
                                            onClick={() => handleDownload(doc.downloadUrl, doc.name)}
                                            sx={{
                                                color: 'primary.main',
                                                '&:hover': {
                                                    backgroundColor: 'primary.light',
                                                    color: 'primary.dark'
                                                }
                                            }}
                                        >
                                            <DownloadIcon />
                                        </IconButton>
                                    </Tooltip>
                                </ListItemSecondaryAction>
                            </ListItem>

                            {index < filteredDocs.length - 1 && (
                                <Divider sx={{ mx: 2 }} />
                            )}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>
        </Box>
    );
}
