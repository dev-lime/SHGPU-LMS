import React from 'react';
import { 
  Typography, 
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Badge,
  Box
} from '@mui/material';

const chats = [
  {
    id: 1,
    name: "Академическая группа",
    lastMessage: "Завтра собрание в 14:00",
    time: "12:30",
    unread: 2,
  },
  {
    id: 2,
    name: "Преподаватель",
    lastMessage: "Пришлите ваши работы",
    time: "10:15",
    unread: 0,
  },
  {
    id: 3,
    name: "Одногруппник",
    lastMessage: "Привет, есть вопросы по заданию",
    time: "Вчера",
    unread: 1,
  },
];

export default function Chat() {
  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" sx={{ p: 2, pb: 1 }}>Чаты</Typography>
      <List>
        {chats.map((chat) => (
          <React.Fragment key={chat.id}>
            <ListItem 
              sx={{
                py: 1.5,
                display: 'flex',
                alignItems: 'flex-start',
              }}
            >
              <ListItemAvatar>
                <Avatar>{chat.name.charAt(0)}</Avatar>
              </ListItemAvatar>
              <Box sx={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                ml: 1,
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%'
                }}>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight="medium"
                    noWrap
                    sx={{ maxWidth: '60%' }}
                  >
                    {chat.name}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    {chat.time}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%'
                }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    noWrap
                    sx={{ maxWidth: '70%' }}
                  >
                    {chat.lastMessage}
                  </Typography>
                  {chat.unread > 0 && (
                    <Badge 
                      badgeContent={chat.unread} 
                      color="primary" 
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              </Box>
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}
