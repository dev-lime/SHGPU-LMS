import { 
  Typography, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText 
} from '@mui/material';

export default function Chat() {
  return (
    <div style={{ padding: 16 }}>
      <Typography variant="h5" gutterBottom>Чат</Typography>
      
      <div style={{ 
        height: 300, 
        overflow: 'auto', 
        border: '1px solid #ddd', 
        padding: 8,
        marginBottom: 16 
      }}>
        <List>
          <ListItem>
            <ListItemText 
              primary="Сообщение 1"
              secondary="Сегодня в 14:30" 
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Сообщение 2" 
              secondary="Сегодня в 15:45"
            />
          </ListItem>
        </List>
      </div>

      <TextField 
        fullWidth 
        label="Введите сообщение" 
        variant="outlined"
        margin="normal"
      />
      <Button 
        variant="contained" 
        color="primary"
        style={{ marginTop: 16 }}
      >
        Отправить
      </Button>
    </div>
  );
}
