import { 
  Card, 
  CardContent, 
  CardActions, // Добавляем этот импорт
  Typography, 
  Button 
} from '@mui/material';

export default function News() {
  const newsItems = [
    {
      title: "Новый курс по Machine Learning",
      date: "15.05.2023",
      content: "Кафедра информатики запускает курс для всех студентов 3-го курса.",
    },
    {
      title: "Обновление расписания",
      date: "10.05.2023", 
      content: "Внесены изменения в расписание на следующую неделю.",
    }
  ];

  return (
    <div style={{ padding: 16 }}>
      <Typography variant="h5" gutterBottom>Новости вуза</Typography>
      
      {newsItems.map((item, index) => (
        <Card key={index} style={{ marginBottom: 16 }}>
          <CardContent>
            <Typography variant="h6">{item.title}</Typography>
            <Typography color="textSecondary" gutterBottom>
              {item.date}
            </Typography>
            <Typography variant="body2">{item.content}</Typography>
          </CardContent>
          <CardActions>
            <Button size="small">Подробнее</Button>
          </CardActions>
        </Card>
      ))}
    </div>
  );
}
