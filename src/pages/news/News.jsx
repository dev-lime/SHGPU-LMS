import { useState, useEffect } from 'react';
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
import SearchBar from '@components/SearchBar';
import { styled } from '@mui/system';

const EllipsisTypography = styled(Typography)({
	display: '-webkit-box',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	WebkitBoxOrient: 'vertical',
});

import newsData from './news-data.json';

export default function News() {
	const [bookmarked, setBookmarked] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [newsItems, setNewsItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

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

			processedData.sort((a, b) => {
				const dateA = new Date(a.date.split('.').reverse().join('-'));
				const dateB = new Date(b.date.split('.').reverse().join('-'));
				return dateB - dateA;
			});

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

	const handleShare = (link) => {
		if (navigator.share) {
			navigator.share({
				title: 'Поделиться новостью',
				url: link
			}).then(() => {
				console.log('Успешно поделились!');
			}).catch((error) => {
				console.error('Ошибка при попытке поделиться:', error);
			});
		} else {
			alert('К сожалению, ваша платформа не поддерживает функцию общего доступа.');
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

				<SearchBar
					placeholder="Поиск"
					value={searchQuery}
					onChange={setSearchQuery}
					width="70%"
				/>
			</Box>

			{filteredNews.length > 0 ? (
				filteredNews.map((item) => (
					<Card
						key={item.id}
						sx={{
							mb: 3,
							borderRadius: 3,
						}}
					>
						<CardContent sx={{ p: 3 }}>
							{/* Заголовок */}
							<CardActionArea
								onClick={() => handleOpenNews(item.link)}
								sx={{
									mb: 1.5,
									'&.Mui-selected, &:focus': { outline: 'none' }
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
										'&.Mui-selected, &:focus': { outline: 'none' }
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
										'&.Mui-selected, &:focus': { outline: 'none' }
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
										}}
									>
										{bookmarked.includes(item.id) ? <Bookmark /> : <BookmarkBorder />}
									</IconButton>
									<IconButton
										size="small"
										onClick={(e) => {
											e.stopPropagation();
											handleShare(item.link);
										}}
										sx={{
											color: 'text.secondary',
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
