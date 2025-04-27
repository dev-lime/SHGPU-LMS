import React from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Button,
    Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate } from 'react-router-dom';

export default function Documents() {
    const navigate = useNavigate();
    const docs = [
        {
            name: 'Справка об обучении',
            description: 'Подтверждает факт обучения в университете',
            downloadUrl: '/documents/certificate.pdf'
        },
        {
            name: 'Академическая ведомость',
            description: 'Содержит информацию об успеваемости и пройденных дисциплинах',
            downloadUrl: '/documents/transcript.pdf'
        },
        {
            name: 'Справка о стипендии',
            description: 'Подтверждает получение стипендии и её размер',
            downloadUrl: '/documents/scholarship.pdf'
        },
        {
            name: 'Приказ о зачислении',
            description: 'Официальный документ о зачислении в университет',
            downloadUrl: '/documents/enrollment-order.pdf'
        },
        {
            name: 'Справка для военкомата',
            description: 'Документ для предоставления в военный комиссариат',
            downloadUrl: '/documents/military-certificate.pdf'
        },
        {
            name: 'Программа обучения',
            description: 'Содержит перечень дисциплин и учебный план',
            downloadUrl: '/documents/curriculum.pdf'
        },
        {
            name: 'Справка о периоде обучения',
            description: 'Указывает даты начала и окончания обучения',
            downloadUrl: '/documents/study-period.pdf'
        },
        {
            name: 'Копия лицензии вуза',
            description: 'Подтверждает аккредитацию университета',
            downloadUrl: '/documents/license-copy.pdf'
        },
        {
            name: 'Справка для налогового вычета',
            description: 'Необходима для оформления налогового возврата за обучение',
            downloadUrl: '/documents/tax-deduction.pdf'
        },
        {
            name: 'Выписка из приказа о переводе',
            description: 'Подтверждает перевод с курса на курс или между факультетами',
            downloadUrl: '/documents/transfer-order.pdf'
        }
    ];

    const handleDownload = (url) => {
        console.log('Downloading:', url);
        const link = document.createElement('a');
        link.href = url;
        link.download = url.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Box sx={{
            padding: { xs: 2, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton
                    onClick={() => navigate(-1)}
                    sx={{ mr: 1 }}
                >
                    <ArrowBackIcon color="primary" />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Документы</Typography>
            </Box>

            <Paper elevation={0} sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider'
            }}>
                <List disablePadding>
                    {docs.map((doc, index) => (
                        <React.Fragment key={index}>
                            <ListItem
                                sx={{
                                    py: 2.5,
                                    px: 2,
                                    alignItems: 'flex-start',
                                    '&:hover': {
                                        backgroundColor: 'action.hover'
                                    }
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5 }}>
                                            {doc.name}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                wordBreak: 'break-word',
                                                pr: 10,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}
                                        >
                                            {doc.description}
                                        </Typography>
                                    }
                                    sx={{ mr: 2 }}
                                />

                                <ListItemSecondaryAction sx={{
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    right: 16
                                }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<DownloadIcon />}
                                        onClick={() => handleDownload(doc.downloadUrl)}
                                        sx={{
                                            textTransform: 'none',
                                            borderRadius: 2,
                                            borderWidth: 1.5,
                                            minWidth: 100,
                                            '&:hover': {
                                                borderWidth: 1.5
                                            },
                                            '&.Mui-selected': {
                                                outline: 'none'
                                            },
                                            '&:focus': {
                                                outline: 'none'
                                            }
                                        }}
                                    >
                                        Скачать
                                    </Button>
                                </ListItemSecondaryAction>
                            </ListItem>

                            {index < docs.length - 1 && (
                                <Divider sx={{ mx: 2 }} />
                            )}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>
        </Box>
    );
}
