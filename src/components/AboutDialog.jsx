import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box
} from '@mui/material';
import pkg from '../../package.json';

export default function AboutDialog({ open, onClose }) {
    const handleRepoClick = () => {
        window.open('https://github.com/dev-lime/SHGPU-LMS', '_blank');
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
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
                        <Box component="span" sx={{ fontWeight: 600 }}>{pkg.name}</Box>
                    </Typography>
                    <Typography variant="body2" component="div" color="text.secondary">
                        Неофициальный клиент Шадринского государственного педагогического университета.
                        <br />
                        Исходный код:
                        <Box
                            component="span"
                            onClick={handleRepoClick}
                            sx={{
                                color: 'primary.main',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                '&:hover': {
                                    color: 'primary.dark'
                                }
                            }}
                        >
                            https://github.com/dev-lime/SHGPU-LMS
                        </Box>
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                        Версия {pkg.version}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, justifyContent: 'right' }}>
                <Button
                    onClick={onClose}
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
                >
                    Закрыть
                </Button>
            </DialogActions>
        </Dialog>
    );
}
