import React from 'react';
import {
    Box,
    Typography,
    IconButton,
    Paper,
    List
} from '@mui/material';
import { ArrowBack, EventRepeat } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CustomListItem from '@components/CustomListItem';

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
                    sx={{ mr: 1 }}
                >
                    <ArrowBack color="primary" />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Студенческий билет</Typography>
            </Box>

            <Paper elevation={0} sx={{
                borderRadius: 3,
                border: '1px solid',
                overflow: 'hidden',
                borderColor: 'divider'
            }}>
                <List disablePadding>
                    <CustomListItem
                        name="В разработке"
                        description="Здесь будет электронная копия студенческого билета"
                        icon={<EventRepeat color="primary" />}
                    />
                </List>
            </Paper>
        </Box>
    );
}
