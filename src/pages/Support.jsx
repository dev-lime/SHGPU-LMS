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
import {
    ArrowBack,
    Email,
    HelpOutline,
    QuestionAnswer,
    BugReport
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Support() {
    const navigate = useNavigate();

    const supportItems = [
        {
            name: 'Частые вопросы',
            description: 'Ответы на популярные вопросы',
            icon: <HelpOutline color="primary" />,
            action: null
        },
        {
            name: 'Написать в поддержку',
            description: 'Отправить сообщение в службу поддержки',
            icon: <Email color="primary" />,
            action: (
                <Button
                    variant="outlined"
                    size="small"
                    sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        borderWidth: 1.5,
                        '&:hover': { borderWidth: 1.5 }
                    }}
                >
                    Написать
                </Button>
            )
        },
        {
            name: 'Чат с поддержкой',
            description: 'Онлайн-чат с оператором',
            icon: <QuestionAnswer color="primary" />,
            action: (
                <Button
                    variant="outlined"
                    size="small"
                    sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        borderWidth: 1.5,
                        '&:hover': { borderWidth: 1.5 }
                    }}
                >
                    Перейти
                </Button>
            )
        },
        {
            name: 'Сообщить об ошибке',
            description: 'Опишите обнаруженную проблему',
            icon: <BugReport color="primary" />,
            action: (
                <Button
                    variant="outlined"
                    size="small"
                    sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        borderWidth: 1.5,
                        '&:hover': { borderWidth: 1.5 }
                    }}
                >
                    Сообщить
                </Button>
            )
        }
    ];

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
                    sx={{
                        mr: 1,
                        '&.Mui-selected': { outline: 'none' },
                        '&:focus': { outline: 'none' }
                    }}
                >
                    <ArrowBack />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Поддержка</Typography>
            </Box>
        </Box>
    );
}
