import { Card, CardContent, Box, Chip, Typography, IconButton, Divider, CardActionArea } from '@mui/material';
import { BookmarkBorder, Bookmark, Share } from '@mui/icons-material';
import { styled } from '@mui/system';

const EllipsisTypography = styled(Typography)({
	display: '-webkit-box',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	WebkitBoxOrient: 'vertical',
});

const NewsCard = ({ item, bookmarkedMap, toggleBookmark, style }) => (
	<div style={style}>
		<Card sx={{ borderRadius: 3, ml: 2, mr: 2, mb: 2 }}>
			<CardContent sx={{ p: 3 }}>
				<CardActionArea
					onClick={() => {
						if (item.link) window.open(item.link, '_blank');
					}}
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

				{item.image && (
					<CardActionArea
						onClick={() => {
							if (item.link) window.open(item.link, '_blank');
						}}
						sx={{
							mb: 2,
							'&.Mui-selected, &:focus': { outline: 'none' }
						}}
					>
						<Box sx={{
							width: '100%',
							height: 200,
							overflow: 'hidden',
							borderRadius: '8px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center'
						}}>
							<img
								src={item.image}
								alt={item.title}
								style={{
									width: '100%',
									height: 'auto',
									maxHeight: '100%',
									objectFit: 'cover'
								}}
								onError={(e) => {
									e.target.style.display = 'none';
								}}
							/>
						</Box>
					</CardActionArea>
				)}

				{item.content && (
					<CardActionArea
						onClick={() => {
							if (item.link) window.open(item.link, '_blank');
						}}
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

				<Divider sx={{ my: 1.5 }} />

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
								toggleBookmark(item);
							}}
							sx={{
								color: bookmarkedMap?.[item.id] ? 'primary.main' : 'text.secondary',
							}}
						>
							{bookmarkedMap?.[item.id] ? <Bookmark /> : <BookmarkBorder />}
						</IconButton>
						<IconButton
							size="small"
							onClick={(e) => {
								e.stopPropagation();
								if (navigator.share) {
									navigator.share({ title: 'Поделиться новостью', url: item.link })
										.catch(() => {});
								} else {
									alert('К сожалению, ваша платформа не поддерживает функцию общего доступа.');
								}
							}}
							sx={{ color: 'text.secondary' }}
						>
							<Share />
						</IconButton>
					</Box>
				</Box>
			</CardContent>
		</Card>
	</div>
);

export default NewsCard;
