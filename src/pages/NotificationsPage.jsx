import { mockNotifications } from "../mockData";
import { List, ListItem, ListItemText, Typography } from "@mui/material";

export const NotificationsPage = () => {
  return (
    <div>
      <Typography variant="h5" sx={{ p: 2 }}>Уведомления</Typography>
      <List>
        {mockNotifications.map((item) => (
          <ListItem key={item.id}>
            <ListItemText primary={item.text} secondary={item.date} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};
