import { mockSchedule } from "../mockData";
import { List, ListItem, ListItemText, Typography } from "@mui/material";

export const SchedulePage = () => {
  return (
    <div>
      <Typography variant="h5" sx={{ p: 2 }}>Расписание</Typography>
      <List>
        {mockSchedule.map((item) => (
          <ListItem key={item.id}>
            <ListItemText primary={item.subject} secondary={`${item.time}, ${item.room}`} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};
