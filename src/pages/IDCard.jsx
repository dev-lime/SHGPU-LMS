import React from 'react';
import {
    Box,
    Typography,
    IconButton
} from '@mui/material';
import {
    ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function IDCard() {
    const navigate = useNavigate();

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
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Студенческий билет</Typography>
            </Box>
        </Box>
    );
}
