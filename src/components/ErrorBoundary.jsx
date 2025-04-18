import React from 'react';
import {
    Box,
    Typography,
    Button
} from '@mui/material';

export default class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('Error Boundary caught:', error, info);
    }

    handleRetry = () => {
        this.setState({ hasError: false });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%'
                }}>
                    <Typography variant="h6" color="error" gutterBottom>
                        Что-то пошло не так
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={this.handleRetry}
                        sx={{ mt: 2 }}
                    >
                        Перезагрузить страницу
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}
