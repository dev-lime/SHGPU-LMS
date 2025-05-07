import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Radio,
    RadioGroup,
    FormControlLabel,
    Button,
    Divider,
    Collapse,
    TextField,
    Popover,
    InputAdornment,
    Slider,
    MenuItem,
    Select
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
import AboutDialog from '@components/AboutDialog';
import CustomListItem from '@components/CustomListItem';

export default function Settings({
    themeConfig,
    onThemeChange,
    tabLabelsMode,
    onTabLabelsModeChange,
    borderRadius,
    onBorderRadiusChange
}) {
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(themeConfig?.mode === 'dark');
    const [aboutOpen, setAboutOpen] = useState(false);
    const [expandedGroups, setExpendedGroups] = useState({});
    const [colorPickerAnchor, setColorPickerAnchor] = useState(null);
    const [selectedColor, setSelectedColor] = useState('');
    const [systemTheme, setSystemTheme] = useState(null);

    const currentColor = themeConfig?.color || 'green';
    const isCustomColor = /^#([0-9A-F]{3}){1,2}$/i.test(currentColor);
    const [customColor, setCustomColor] = useState(isCustomColor ? currentColor : '');

    const colorOptions = {
        green: '#4CAF50',
        blue: '#2196F3',
        red: '#F44336'
    };

    useEffect(() => {
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemThemeChange = (e) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };

        setSystemTheme(darkModeMediaQuery.matches ? 'dark' : 'light');
        darkModeMediaQuery.addListener(handleSystemThemeChange);

        return () => {
            darkModeMediaQuery.removeListener(handleSystemThemeChange);
        };
    }, []);

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

    const handleThemeModeChange = (event) => {
        const mode = event.target.value;
        setDarkMode(mode === 'dark' || (mode === 'system' && systemTheme === 'dark'));
        onThemeChange({ ...themeConfig, mode });
    };

    const handleTabLabelsModeChange = (event) => {
        onTabLabelsModeChange(event.target.value);
    };

    const getThemeIcon = () => {
        const currentMode = themeConfig?.mode || 'light';
        if (currentMode === 'system') {
            return systemTheme === 'dark' ? <Brightness4 color="primary" /> : <Brightness7 color="primary" />;
        }
        return currentMode === 'dark' ? <Brightness4 color="primary" /> : <Brightness7 color="primary" />;
    };

    const getDisplayedTheme = () => {
        if (themeConfig?.mode === 'system') {
            return `Как в системе`;
        }
        return themeConfig?.mode === 'dark' ? 'Тёмная' : 'Светлая';
    };

    const handleAboutOpen = () => setAboutOpen(true);
    const handleAboutClose = () => setAboutOpen(false);

    const settingsItems = [
        {
            name: "Тема",
            icon: getThemeIcon(),
            action: (
                <Select
                    value={themeConfig?.mode || 'light'}
                    onChange={handleThemeModeChange}
                    size="small"
                    sx={{ width: 180 }}
                    renderValue={(value) => getDisplayedTheme()}
                >
                    <MenuItem value="light">Светлая</MenuItem>
                    <MenuItem value="dark">Тёмная</MenuItem>
                    <MenuItem value="system">Как в системе</MenuItem>
                </Select>
            )
        },
        {
            name: "Названия вкладок",
            icon: <TextFields color="primary" />,
            action: (
                <Select
                    value={tabLabelsMode}
                    onChange={handleTabLabelsModeChange}
                    size="small"
                    sx={{ width: 180 }}
                >
                    <MenuItem value="showAll">Показывать</MenuItem>
                    <MenuItem value="hideAll">Скрыть всё</MenuItem>
                    <MenuItem value="currentOnly">Только на текущей</MenuItem>
                </Select>
            )
        },
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
                            <CustomListItem
                                name={item.name}
                                description={item.description}
                                icon={item.icon}
                                onClick={item.onClick}
                                action={item.action}
                                expandable={item.expandable}
                                isExpanded={item.isExpanded}
                                toggle={item.toggle}
                            />

                            {item.children && (
                                <Collapse in={item.isExpanded} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {item.children.map((child, childIndex) => (
                                            <ListItem
                                                key={childIndex}
                                                sx={{ pl: 6 }}
                                                secondaryAction={child.action && (
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        flexShrink: 0
                                                    }}>
                                                        {child.action}
                                                    </Box>
                                                )}
                                            >
                                                <ListItemText
                                                    primary={<Typography variant="body2">{child.name}</Typography>}
                                                    secondary={child.description}
                                                    sx={{
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                    slotProps={{
                                                        primary: {
                                                            noWrap: true,
                                                            sx: { maxWidth: 'calc(100% - 200px)' }
                                                        }
                                                    }}
                                                />
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

            <AboutDialog
                open={aboutOpen}
                onClose={handleAboutClose}
            />
        </Box>
    );
}
