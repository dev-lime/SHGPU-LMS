import React from 'react';
import {
    ListItem,
    ListItemText,
    Box,
    Typography
} from '@mui/material';

const CustomListItem = ({
    name,
    description,
    icon,
    onClick,
    action,
    secondaryAction,
    expandable,
    isExpanded,
    toggle
}) => {
    return (
        <ListItem
            onClick={expandable ? toggle : onClick}
            sx={{
                py: 2,
                px: 2,
                '&:hover': {
                    backgroundColor: 'action.hover',
                    cursor: onClick || expandable ? 'pointer' : 'default'
                }
            }}
            secondaryAction={secondaryAction || action}
        >
            {icon && (
                <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                    {icon}
                </Box>
            )}
            <ListItemText
                primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {name}
                    </Typography>
                }
                secondary={description}
                sx={{ mr: 2 }}
                slotProps={{
                    primary: {
                        noWrap: true,
                        sx: { maxWidth: 'calc(100% - 200px)' }
                    }
                }}
            />
        </ListItem>
    );
};

export default CustomListItem;
