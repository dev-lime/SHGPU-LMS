import React, { useEffect, useRef } from 'react';
import {
    TextField,
    InputAdornment,
    Box,
    IconButton
} from '@mui/material';
import { Search, Close } from '@mui/icons-material';

const SearchBar = ({
    placeholder = 'Поиск',
    value,
    onChange,
    width = '100%',
    sx = {},
    autoFocus = false // Новый необязательный параметр
}) => {
    const inputRef = useRef(null);

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    const handleClear = () => {
        onChange('');
    };

    return (
        <Box sx={{ width, ...sx }}>
            <TextField
                variant="outlined"
                placeholder={placeholder}
                size="small"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                fullWidth
                inputRef={inputRef}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '28px',
                        backgroundColor: 'background.paper',
                        '& fieldset': {
                            borderColor: 'divider',
                        },
                        '&:hover fieldset': {
                            borderColor: 'primary.main',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: '1px',
                        },
                    },
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search color="primary" />
                        </InputAdornment>
                    ),
                    endAdornment: value && (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={handleClear}
                                size="small"
                                sx={{
                                    color: 'text.secondary',
                                    '&:hover': {
                                        color: 'primary.main',
                                        backgroundColor: 'transparent'
                                    }
                                }}
                            >
                                <Close fontSize="small" />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
        </Box>
    );
};

export default SearchBar;
