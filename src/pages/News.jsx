import { Card, CardContent, Typography } from "@mui/material";

export default function News() {
  return (
    <div style={{ padding: 16 }}>
      <Typography variant="h5" gutterBottom>Новости вуза</Typography>
      {[1, 2, 3].map((item) => (
        <Card key={item} style={{ marginBottom: 16 }}>
          <CardContent>
            <Typography variant="h6">Новость {item}</Typography>
            <Typography variant="body2">Краткое описание новости...</Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
