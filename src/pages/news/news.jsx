import { useState, useEffect } from 'react';
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
	useTheme,
	styled
} from '@mui/material';
import {
	BookmarkBorder,
	Bookmark,
	Share,
	Search
} from '@mui/icons-material';

const EllipsisTypography = styled(Typography)({
	display: '-webkit-box',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	WebkitBoxOrient: 'vertical',
});

import newsData from './news.json';

export default function News() {
	const [bookmarked, setBookmarked] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [newsItems, setNewsItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const theme = useTheme();

	useEffect(() => {
		try {
			const processedData = newsData.map(item => ({
				id: item.id || '',
				title: item.title || 'Без названия',
				date: item.date || '',
				image: item.image || null,
				link: item.link || null,
				content: item.content || '',
				category: item.category || 'Без категории'
			}));

			setNewsItems(processedData);
			setLoading(false);
		} catch (err) {
			setError('Ошибка загрузки новостей');
			console.error('Ошибка парсинга новостей:', err);
			setLoading(false);
		}
	}, []);

	const toggleBookmark = (id) => {
		if (bookmarked.includes(id)) {
			setBookmarked(bookmarked.filter(item => item !== id));
		} else {
			setBookmarked([...bookmarked, id]);
		}
	};

	const handleOpenNews = (link) => {
		if (link) {
			window.open(link, '_blank');
		}
	};

	const filteredNews = newsItems.filter(item =>
		item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
		(item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
		item.category.toLowerCase().includes(searchQuery.toLowerCase())
	);

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
				<Typography variant="h6">Загрузка новостей...</Typography>
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
				<Typography variant="h6" color="error">{error}</Typography>
			</Box>
		);
	}

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
							{/* Заголовок */}
							<CardActionArea
								onClick={() => handleOpenNews(item.link)}
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
								<EllipsisTypography
									variant="h6"
									sx={{
										fontWeight: 600,
										color: 'text.primary',
										minHeight: '3em',
										lineHeight: '1.5em',
										WebkitLineClamp: 2
									}}
								>
									{item.title}
								</EllipsisTypography>
							</CardActionArea>

							{/* Изображение */}
							{item.image && (
								<CardActionArea
									onClick={() => handleOpenNews(item.link)}
									sx={{
										mb: 2,
										'&.Mui-selected': {
											outline: 'none'
										},
										'&:focus': {
											outline: 'none'
										},
										borderRadius: 0
									}}
								>
									<img
										src={item.image}
										alt={item.title}
										style={{
											maxWidth: '100%',
											height: 'auto',
											borderRadius: '8px'
										}}
										onError={(e) => {
											e.target.style.display = 'none';
										}}
									/>
								</CardActionArea>
							)}

							{/* Описание */}
							{item.content && (
								<CardActionArea
									onClick={() => handleOpenNews(item.link)}
									sx={{
										mb: 2,
										'&.Mui-selected': {
											outline: 'none'
										},
										'&:focus': {
											outline: 'none'
										},
										borderRadius: 0
									}}
								>
									<EllipsisTypography
										variant="body1"
										color="text.secondary"
										sx={{
											minHeight: '6em',
											lineHeight: '1.5em',
											WebkitLineClamp: 4
										}}
									>
										{item.content}
									</EllipsisTypography>
								</CardActionArea>
							)}

							<Divider sx={{
								my: 1.5,
								backgroundColor: 'divider'
							}} />

							<Box sx={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center'
							}}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									{item.category && (
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
									)}
									{item.date && (
										<Typography
											color="text.secondary"
											variant="body2"
											sx={{ fontSize: '0.8rem' }}
										>
											{item.date}
										</Typography>
									)}
								</Box>

								<Box>
									<IconButton
										size="small"
										onClick={(e) => {
											e.stopPropagation();
											toggleBookmark(item.id);
										}}
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
										onClick={(e) => e.stopPropagation()}
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
