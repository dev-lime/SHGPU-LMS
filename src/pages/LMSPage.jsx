import { mockLMS } from "../mockData";
import { LinearProgress, List, ListItem, ListItemText, Typography } from "@mui/material";

export const LMSPage = () => {
  return (
    <div>
      <Typography variant="h5" sx={{ p: 2 }}>ЭИОС</Typography>
      <List>
        {mockLMS.map((item) => (
          <ListItem key={item.id}>
            <ListItemText primary={item.course} />
            <LinearProgress variant="determinate" value={item.progress} sx={{ width: "100%" }} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};
