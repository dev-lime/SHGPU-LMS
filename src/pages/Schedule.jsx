import { Table, TableBody, TableCell, TableRow } from "@mui/material";
import { Typography, Card, CardContent } from '@mui/material';

export default function Schedule() {
  const days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"];

  return (
    <div style={{ padding: 16 }}>
      <Typography variant="h5" gutterBottom>Расписание</Typography>
      <Table>
        <TableBody>
          {days.map((day, index) => (
            <TableRow key={index}>
              <TableCell>{day}</TableCell>
              <TableCell>9:00 - Лекция по предмету {index + 1}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
