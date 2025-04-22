import { useState } from 'react';
import {
	Card,
	CardContent,
	Box,
	Chip,
	Typography,
	IconButton,
	Divider,
	CardActionArea,
	TextField,
	InputAdornment,
	useTheme
} from '@mui/material';
import {
	BookmarkBorder,
	Bookmark,
	Share,
	Search
} from '@mui/icons-material';

export default function News() {
	const [bookmarked, setBookmarked] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const theme = useTheme();

	const newsItems = [
		{
			id: 1,
			title: "Всероссийский марафон «Молодым хранить память»",
			date: "15.04.2025",
			content: "Ко Дню единых действий в память о геноциде советского народа в годы Великой Отечественной войны в ШГПУ проходит ряд мероприятий...",
			category: "Новости"
		},
		{
			id: 2,
			title: "X региональный чемпионат «Абилипикс»",
			date: "15.04.2025",
			content: "11 апреля в Курганской области назвали Победителей X регионального чемпионата «Абилимпикс»",
			category: "Наука"
		},
		{
			id: 3,
			title: "ШГПУ выпустили новых дизайнеров",
			date: "15.04.2025",
			content: "10 марта состоялись защиты дипломных проектов у дизайнеров, обучающихся на профиле \"Графический дизайн\"",
			category: "Студенческая жизнь"
		},
		{
			id: 4,
			title: "Звёзды спорта зажгли: зарядка с легендами!",
			date: "14.04.2025",
			content: "В зарядке приняли участие ректор ШГПУ Артур Русланович Дзиов, Подкорытов Михаил, Парилова Екатерина...",
			category: "Спорт"
		}
	];

	const toggleBookmark = (id) => {
		if (bookmarked.includes(id)) {
			setBookmarked(bookmarked.filter(item => item !== id));
		} else {
			setBookmarked([...bookmarked, id]);
		}
	};

	const filteredNews = newsItems.filter(item =>
		item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
		item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
		item.category.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<Box sx={{
			height: '100%',
			display: 'flex',
			flexDirection: 'column',
			p: 2
		}}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Typography
					variant="h5"
					sx={{
						fontWeight: 600,
						color: 'text.primary',
						whiteSpace: 'nowrap'
					}}
				>
					Новости
				</Typography>

				<TextField
					variant="outlined"
					placeholder="Поиск"
					size="small"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					sx={{
						width: '70%',
						'& .MuiOutlinedInput-root': {
							borderRadius: '28px',
							backgroundColor: 'background.paper',
							'& fieldset': {
								borderColor: 'divider',
							},
							'&:hover fieldset': {
								borderColor: 'primary.main',
							},
							'&.Mui-focused fieldset': {
								borderColor: 'primary.main',
								borderWidth: '1px',
							},
						},
					}}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<Search color="primary" />
							</InputAdornment>
						),
					}}
				/>
			</Box>

			{filteredNews.length > 0 ? (
				filteredNews.map((item) => (
					<Card
						key={item.id}
						sx={{
							mb: 3,
							borderRadius: 3,
							border: theme.palette.mode === 'light' ? '1px solid #e0e0e0' : 'none',
							boxShadow: theme.palette.mode === 'light' ? '0px 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
							backgroundColor: 'surface.main',
							transition: 'background-color 0.2s, box-shadow 0.2s',
							'&:hover': {
								backgroundColor: 'surface.hover',
								boxShadow: theme.palette.mode === 'light' ? '0px 4px 12px rgba(0, 0, 0, 0.15)' : 'none'
							},
							overflow: 'hidden',
						}}
					>
						<CardContent sx={{ p: 3 }}>
							{/* News title */}
							<CardActionArea
								onClick={() => console.log('Open news', item.id)}
								sx={{
									mb: 1.5,
									'&.Mui-selected': {
										outline: 'none'
									},
									'&:focus': {
										outline: 'none'
									},
									borderRadius: 0
								}}
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

							{/* Bottom section - category, date and buttons */}
							<Box sx={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center'
							}}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

								<Box>
									<IconButton
										size="small"
										onClick={() => toggleBookmark(item.id)}
										sx={{
											color: bookmarked.includes(item.id) ? 'primary.main' : 'text.secondary',
											'&:hover': {
												backgroundColor: 'transparent',
												color: 'primary.main'
											},
											'&.Mui-selected': {
												outline: 'none'
											},
											'&:focus': {
												outline: 'none'
											},
											borderRadius: 0
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
											},
											'&.Mui-selected': {
												outline: 'none'
											},
											'&:focus': {
												outline: 'none'
											},
											borderRadius: 0
										}}
									>
										<Share />
									</IconButton>
								</Box>
							</Box>
						</CardContent>
					</Card>
				))
			) : (
				<Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
					Ничего не найдено
				</Typography>
			)}
		</Box>
	);
}
