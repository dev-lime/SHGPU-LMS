import { List, ListItem, ListItemText } from "@mui/material";
import { Typography, Card, CardContent } from '@mui/material';

export default function Eios() {
  const courses = ["Математика", "Физика", "Программирование"];

  return (
    <div style={{ padding: 16 }}>
      <Typography variant="h5" gutterBottom>ЭИОС</Typography>
      <List>
        {courses.map((course, index) => (
          <ListItem button key={index}>
            <ListItemText primary={course} />
          </ListItem>
        ))}
      </List>
    </div>
  );
}
