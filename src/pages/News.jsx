import {
	Card,
	CardContent,
	Box,
	Chip,
	Typography,
	IconButton,
	Divider,
	CardActionArea
} from '@mui/material';
import {
	BookmarkBorder,
	Bookmark,
	Share
} from '@mui/icons-material';
import { useState } from 'react';

export default function News() {
	const [bookmarked, setBookmarked] = useState([]);

	const newsItems = [
		{
			id: 1,
			title: "Новый курс по Machine Learning",
			date: "15.05.2025",
			content: "Кафедра информатики запускает курс для всех студентов 3-го курса. Программа включает изучение нейронных сетей, обработку естественного языка и компьютерное зрение.",
			category: "Образование",
			author: "Кафедра информатики"
		},
		{
			id: 2,
			title: "Обновление расписания",
			date: "10.05.2025",
			content: "Внесены изменения в расписание на следующую неделю. Обратите внимание на изменения в аудиториях для практических занятий.",
			category: "Расписание",
			author: "Учебный отдел"
		},
		{
			id: 3,
			title: "Студенческая конференция по ИИ",
			date: "22.11.2024",
			content: "Приглашаем всех желающих принять участие в ежегодной студенческой конференции по искусственному интеллекту. Регистрация до 18 мая.",
			category: "Мероприятия",
			author: "Студенческий совет"
		}
	];

	const toggleBookmark = (id) => {
		if (bookmarked.includes(id)) {
			setBookmarked(bookmarked.filter(item => item !== id));
		} else {
			setBookmarked([...bookmarked, id]);
		}
	};

	return (
		<Box sx={{
			padding: { xs: 2, sm: 3 },
			maxWidth: 800,
			margin: '0 auto'
		}}>
			<Typography
				variant="h5"
				gutterBottom
				sx={{
					fontWeight: 600,
					mb: 3,
					color: 'text.primary'
				}}
			>
				Новости
			</Typography>

			{newsItems.map((item) => (
				<Card
					key={item.id}
					sx={{
						mb: 3,
						borderRadius: 3,
						border: 'none',
						boxShadow: 'none',
						backgroundColor: 'surface.main',
						transition: 'background-color 0.2s',
						'&:hover': {
							backgroundColor: 'surface.hover'
						},
						overflow: 'hidden',
					}}
				>
					<CardContent sx={{ p: 3 }}>
						{/* Header and date */}
						<Box sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							mb: 2
						}}>
							<Chip
								label={item.category}
								size="small"
								variant="outlined"
								sx={{
									fontWeight: 500,
									borderColor: 'primary.main',
									color: 'primary.main',
									backgroundColor: 'transparent'
								}}
							/>
							<Typography
								color="text.secondary"
								variant="body2"
								sx={{ fontSize: '0.8rem' }}
							>
								{item.date}
							</Typography>
						</Box>

						{/* News title - make this clickable instead of the whole card */}
						<CardActionArea
							onClick={() => console.log('Open news', item.id)}
							sx={{ mb: 1.5 }}
						>
							<Typography
								variant="h6"
								sx={{
									fontWeight: 600,
									color: 'text.primary'
								}}
							>
								{item.title}
							</Typography>
						</CardActionArea>

						{/* News content */}
						<Typography
							variant="body1"
							color="text.secondary"
							sx={{ mb: 2 }}
						>
							{item.content}
						</Typography>

						<Divider sx={{
							my: 1.5,
							backgroundColor: 'divider'
						}} />

						{/* Author and buttons */}
						<Box sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center'
						}}>
							<Typography variant="body2" color="text.secondary">
								{item.author}
							</Typography>

							<Box>
								<IconButton
									size="small"
									onClick={() => toggleBookmark(item.id)}
									sx={{
										color: bookmarked.includes(item.id) ? 'primary.main' : 'text.secondary',
										'&:hover': {
											backgroundColor: 'transparent',
											color: 'primary.main'
										}
									}}
								>
									{bookmarked.includes(item.id) ? <Bookmark /> : <BookmarkBorder />}
								</IconButton>
								<IconButton
									size="small"
									sx={{
										color: 'text.secondary',
										'&:hover': {
											backgroundColor: 'transparent',
											color: 'primary.main'
										}
									}}
								>
									<Share />
								</IconButton>
							</Box>
						</Box>
					</CardContent>
				</Card>
			))}
		</Box>
	);
}
