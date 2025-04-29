import React, { useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Paper
} from '@mui/material';
import {
    ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SearchBar from '@components/SearchBar';

const FAQ_CATEGORIES = [
    {
        title: "Общие вопросы",
        questions: [
            {
                question: "Что делать, если не отображается расписание?",
                answer: "Убедитесь, что в профиле указана правильная группа. Если проблема не исчезла — обратитесь в поддержку."
            },
            {
                question: "Как включить уведомления?",
                answer: "Перейдите в Настройки → Уведомления и включите нужные категории (новости, расписание, сообщения и т.д.)."
            }
        ]
    },
    {
        title: "Новости",
        questions: [
            {
                question: "Почему я не вижу новости с сайта ВУЗа?",
                answer: "Иногда сайт обновляется с задержкой. Попробуйте обновить ленту или проверьте подключение к интернету."
            }
        ]
    },
    {
        title: "Мессенджер",
        questions: [
            {
                question: "С кем я могу переписываться?",
                answer: "Вы можете общаться с сокурсниками, преподавателями, кураторами и любым другим человеком, зарегистрированным в системе."
            },
            {
                question: "Как найти нужного преподавателя?",
                answer: "Перейдите во вкладку 'Мессенджер' → 'Поиск', введите ФИО или предмет — и выберите нужного преподавателя."
            }
        ]
    },
    {
        title: "Документы",
        questions: [
            {
                question: "Как сгенерировать справку об обучении или заявление?",
                answer: "Перейдите в 'Документы' → Выберите нужный шаблон → 'Автозаполнение' → Скачайте и распечатайте."
            },
            {
                question: "Можно ли подать заявление через приложение?",
                answer: "Пока нет. Тут вы можете только подготовить документ для печати."
            }
        ]
    },
    {
        title: "Профиль",
        questions: [
            {
                question: "Как сменить группу или факультет?",
                answer: "Пока это можно сделать только через настройки."
            }
        ]
    }
];

export default function Support() {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Фильтрация вопросов на основе введенного текста
    const filteredCategories = FAQ_CATEGORIES.map(category => ({
        ...category,
        questions: category.questions.filter(question =>
            question.question.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(category => category.questions.length > 0); // Оставляем только категории с вопросами

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
                    <ArrowBack color="primary" />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>Поддержка</Typography>

                <SearchBar
                    placeholder="Поиск"
                    value={searchTerm}
                    onChange={setSearchTerm}
                    width="55%"
                />
            </Box>

            {filteredCategories.map((category, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                        {category.title}
                    </Typography>
                    <Paper elevation={2} sx={{ padding: 2, borderRadius: 2 }}>
                        {category.questions.map((item, idx) => (
                            <Box key={idx} sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                    {item.question}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {item.answer}
                                </Typography>
                            </Box>
                        ))}
                    </Paper>
                </Box>
            ))}
        </Box>
    );
}
