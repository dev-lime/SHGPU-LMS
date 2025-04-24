import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Switch,
    Radio,
    RadioGroup,
    FormControlLabel,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider
} from '@mui/material';
import {
    ArrowBack,
    Palette,
    Brightness4,
    Brightness7,
    Info,
    Chat as ChatIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Settings({ themeConfig, onThemeChange, onHideTabLabelsChange }) {
    const navigate = useNavigate();
    const [primaryColor, setPrimaryColor] = useState(themeConfig?.color || 'green');
    const [darkMode, setDarkMode] = useState(themeConfig?.mode === 'dark');
    const [hideTabLabels, setHideTabLabels] = useState(localStorage.getItem('hideTabLabels') === 'true');
    const [aboutOpen, setAboutOpen] = useState(false);

    const colorOptions = {
        green: '#4CAF50',
        purple: '#6750A4',
        blue: '#2196F3',
        orange: '#FF9800',
        red: '#F44336',
        pink: '#E91E63'
    };

    const handleColorChange = (event) => {
        const color = event.target.value;
        setPrimaryColor(color);
        onThemeChange({ ...themeConfig, color });
    };

    const handleThemeChange = (event) => {
        const mode = event.target.checked ? 'dark' : 'light';
        setDarkMode(event.target.checked);
        onThemeChange({ ...themeConfig, mode });
    };

    const handleTabLabelsChange = (event) => {
        const hide = event.target.checked;
        setHideTabLabels(hide);
        localStorage.setItem('hideTabLabels', hide);
        if (onHideTabLabelsChange) {
            onHideTabLabelsChange(hide);
        }
    };

    const handleAboutOpen = () => setAboutOpen(true);
    const handleAboutClose = () => setAboutOpen(false);

    const settingsItems = [
        {
            name: "Цветовая схема",
            icon: <Palette color="primary" />,
            action: (
                <RadioGroup
                    row
                    value={primaryColor}
                    onChange={handleColorChange}
                    sx={{ ml: 2 }}
                >
                    {Object.entries(colorOptions).map(([name, color]) => (
                        <FormControlLabel
                            key={name}
                            value={name}
                            control={
                                <Radio
                                    size="small"
                                    sx={{ color, '&.Mui-checked': { color } }}
                                />
                            }
                            label=""
                            sx={{ mr: 0 }}
                        />
                    ))}
                </RadioGroup>
            )
        },
        {
            name: "Тёмная тема",
            icon: darkMode ? <Brightness4 color="primary" /> : <Brightness7 color="primary" />,
            action: (
                <Switch
                    checked={darkMode}
                    onChange={handleThemeChange}
                    color="primary"
                />
            )
        },
        {
            name: "Скрыть текст вкладок",
            icon: <ChatIcon color="primary" />,
            action: (
                <Switch
                    checked={hideTabLabels}
                    onChange={handleTabLabelsChange}
                    color="primary"
                />
            )
        },
        {
            name: "О приложении",
            icon: <Info color="primary" />,
            action: null,
            onClick: handleAboutOpen
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
                        '&.Mui-selected, &:focus': { outline: 'none' },
                        cursor: 'pointer'
                    }}
                >
                    <ArrowBack color="primary" />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Настройки</Typography>
            </Box>

            <Paper elevation={0} sx={{
                borderRadius: 3,
                border: '1px solid',
                overflow: 'hidden',
                borderColor: 'divider'
            }}>
                <List disablePadding>
                    {settingsItems.map((item, index) => (
                        <React.Fragment key={index}>
                            <ListItem
                                onClick={item.onClick}
                                sx={{
                                    py: 2,
                                    px: 2,
                                    '&:hover': {
                                        backgroundColor: 'action.hover',
                                        cursor: 'pointer'
                                    },
                                    color: item.color || 'text.primary'
                                }}
                            >
                                <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                                    {item.icon}
                                </Box>

                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                            {item.name}
                                        </Typography>
                                    }
                                    secondary={item.description}
                                    sx={{ mr: 2 }}
                                />

                                {item.action && (
                                    <ListItemSecondaryAction>
                                        {item.action}
                                    </ListItemSecondaryAction>
                                )}
                            </ListItem>

                            {index < settingsItems.length - 1 && (
                                <Divider sx={{ mx: 2 }} />
                            )}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>

            <Dialog
                open={aboutOpen}
                onClose={handleAboutClose}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        bgcolor: 'background.paper',
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{
                    typography: 'h6',
                    color: 'text.primary',
                    px: 3,
                    pt: 3
                }}>
                    О приложении
                </DialogTitle>
                <DialogContent sx={{ px: 3, py: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="body1" component="div" color="text.primary">
                            <Box component="span" sx={{ fontWeight: 600 }}>SHGPU-LMS</Box>
                        </Typography>
                        <Typography variant="body2" component="div" color="text.secondary">
                            Учебная платформа Шадринского государственного педагогического университета
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                            Версия 0.2 Demo
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2, justifyContent: 'right' }}>
                    <Button
                        onClick={handleAboutClose}
                        color="primary"
                        variant="contained"
                        sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            minWidth: 120,
                            '&.Mui-selected, &:focus': { outline: 'none' },
                            cursor: 'pointer'
                        }}
                        autoFocus
                    >
                        Закрыть
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
