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
    Divider,
    Collapse,
    TextField,
    Popover,
    InputAdornment,
    Slider
} from '@mui/material';
import {
    ArrowBack,
    Palette,
    Brightness4,
    Brightness7,
    Info,
    TextFields,
    Colorize,
    Interests
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { HexColorPicker } from 'react-colorful';

export default function Settings({
    themeConfig,
    onThemeChange,
    hideTabLabels,
    onHideTabLabelsChange,
    keepCurrentTabLabel,
    onKeepCurrentTabLabelChange,
    borderRadius,
    onBorderRadiusChange
}) {
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(themeConfig?.mode === 'dark');
    const [aboutOpen, setAboutOpen] = useState(false);
    const [expandedGroups, setExpendedGroups] = useState({});
    const [colorPickerAnchor, setColorPickerAnchor] = useState(null);
    const [selectedColor, setSelectedColor] = useState('');

    const currentColor = themeConfig?.color || 'green';
    const isCustomColor = /^#([0-9A-F]{3}){1,2}$/i.test(currentColor);
    const [customColor, setCustomColor] = useState(isCustomColor ? currentColor : '');

    const colorOptions = {
        green: '#4CAF50',
        blue: '#2196F3',
        red: '#F44336'
    };

    const handleBorderRadiusChange = (event, newValue) => {
        onBorderRadiusChange(newValue);
    };

    const handleCustomColorChange = (e) => {
        const value = e.target.value;
        setCustomColor(value);

        const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(value);
        if (isHex) {
            onThemeChange({ ...themeConfig, color: value });
        }
    };

    const handleColorPickerOpen = (event) => {
        setSelectedColor(customColor);
        setColorPickerAnchor(event.currentTarget);
    };

    const handleColorPickerClose = () => {
        setColorPickerAnchor(null);
    };

    const handleColorPickerChange = (color) => {
        setSelectedColor(color);
    };

    const handleColorPickerApply = () => {
        setCustomColor(selectedColor);
        onThemeChange({ ...themeConfig, color: selectedColor });
        handleColorPickerClose();
    };

    const toggleGroup = (name) => {
        setExpendedGroups(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const handleColorChange = (event) => {
        const color = event.target.value;
        setCustomColor('');
        onThemeChange({ ...themeConfig, color });
    };

    const handleThemeChange = (event) => {
        const mode = event.target.checked ? 'dark' : 'light';
        setDarkMode(event.target.checked);
        onThemeChange({ ...themeConfig, mode });
    };

    const handleTabLabelsChange = (event) => {
        const hide = event.target.checked;
        onHideTabLabelsChange(hide);
    };

    const handleCurrentTabLabelChange = (event) => {
        onKeepCurrentTabLabelChange(event.target.checked);
    };

    const handleAboutOpen = () => setAboutOpen(true);
    const handleAboutClose = () => setAboutOpen(false);

    const settingsItems = [
        {
            name: "Цветовая схема",
            icon: <Palette color="primary" />,
            expandable: true,
            isExpanded: expandedGroups['color'],
            toggle: () => toggleGroup('color'),
            action: (
                <RadioGroup
                    row
                    value={isCustomColor ? 'custom' : currentColor}
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
            ),
            children: [
                {
                    name: "Пользовательский цвет",
                    action: (
                        <TextField
                            value={customColor}
                            onChange={handleCustomColorChange}
                            placeholder="#RRGGBB"
                            size="small"
                            sx={{ width: 125 }}
                            InputProps={{
                                sx: { fontSize: 14 },
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleColorPickerOpen}
                                            edge="end"
                                            sx={{ padding: '6px' }}
                                        >
                                            <Colorize fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    )
                }
            ]
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
            name: "Скругления",
            icon: <Interests color="primary" />,
            action: (
                <Slider
                    value={themeConfig.borderRadius}
                    onChange={handleBorderRadiusChange}
                    min={0}
                    max={24}
                    step={1}
                    valueLabelDisplay="auto"
                    sx={{ width: 150 }}
                    marks={[
                        { value: 0, label: '0' },
                        { value: 8, label: '8' },
                        { value: 16, label: '16' },
                        { value: 24, label: '24' }
                    ]}
                />
            )
        },
        {
            name: "Скрыть названия вкладок",
            icon: <TextFields color="primary" />,
            expandable: true,
            isExpanded: expandedGroups['tabLabels'],
            toggle: () => toggleGroup('tabLabels'),
            action: (
                <Switch
                    checked={hideTabLabels}
                    onChange={handleTabLabelsChange}
                    color="primary"
                />
            ),
            children: [
                {
                    name: "Не скрывать название текущей вкладки",
                    description: !hideTabLabels ? "Доступно только при включённом 'Скрыть названия вкладок'" : null,
                    action: (
                        <Switch
                            checked={keepCurrentTabLabel}
                            onChange={handleCurrentTabLabelChange}
                            color="primary"
                            disabled={!hideTabLabels}
                        />
                    )
                }
            ]
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
                                onClick={item.expandable ? item.toggle : item.onClick}
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
                                    primary={<Typography variant="subtitle1" sx={{ fontWeight: 500 }}>{item.name}</Typography>}
                                    secondary={item.description}
                                    sx={{ mr: 2 }}
                                />
                                {item.action && (
                                    <ListItemSecondaryAction>
                                        {item.action}
                                    </ListItemSecondaryAction>
                                )}
                            </ListItem>

                            {item.children && (
                                <Collapse in={item.isExpanded} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {item.children.map((child, childIndex) => (
                                            <ListItem key={childIndex} sx={{ pl: 6 }}>
                                                <ListItemText
                                                    primary={<Typography variant="body2">{child.name}</Typography>}
                                                    secondary={child.description}
                                                />
                                                {child.action && (
                                                    <ListItemSecondaryAction>
                                                        {child.action}
                                                    </ListItemSecondaryAction>
                                                )}
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>
                            )}

                            {index < settingsItems.length - 1 && (
                                <Divider sx={{ mx: 2 }} />
                            )}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>

            <Popover
                open={Boolean(colorPickerAnchor)}
                anchorEl={colorPickerAnchor}
                onClose={handleColorPickerClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <HexColorPicker
                    color={selectedColor}
                    onChange={handleColorPickerChange}
                />
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button
                        onClick={handleColorPickerApply}
                        size="small"
                        variant="contained"
                        sx={{
                            '&.Mui-selected, &:focus': { outline: 'none' }
                        }}
                    >
                        Готово
                    </Button>
                </Box>
            </Popover>

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
