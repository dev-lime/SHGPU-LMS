import { Table, TableBody, TableCell, TableRow } from "@mui/material";
import { Typography } from '@mui/material';

export default function Schedule() {
  return (
    <div style={{ padding: 16 }}>
      <Typography variant="h5" gutterBottom>Расписание</Typography>
      <Table>
        <TableBody>
          {[
            { day: "Понедельник", classes: "9:00 - Мат. анализ (ауд. 304)" },
            { day: "Вторник", classes: "10:00 - Python (ауд. 415)" },
            { day: "Среда", classes: "11:00 - Базы данных (ауд. 203)" }
          ].map((row) => (
            <TableRow key={row.day}>
              <TableCell><b>{row.day}</b></TableCell>
              <TableCell>{row.classes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
