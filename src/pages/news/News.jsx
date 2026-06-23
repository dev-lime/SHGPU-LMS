import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { List, useDynamicRowHeight } from 'react-window';
import SearchBar from '@components/SearchBar';
import NewsCard from '@components/NewsCard';
import { db, auth } from '@src/firebase';
import { doc, setDoc, deleteDoc, collection, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';

import newsData from './news-data.json';

const NewsRow = ({ index, style, items, bookmarkedMap, toggleBookmark }) => (
	<NewsCard
		item={items[index]}
		bookmarkedMap={bookmarkedMap}
		toggleBookmark={toggleBookmark}
		style={{ ...style }}
	/>
);

export default function News() {
	const [bookmarkedMap, setBookmarkedMap] = useState({});
	const [searchQuery, setSearchQuery] = useState('');
	const [newsItems] = useState(() => {
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

			return processedData;
		} catch (err) {
			console.error('Ошибка парсинга новостей:', err);
			return [];
		}
	});
	useEffect(() => {
		if (!auth.currentUser) return;
		const q = query(
			collection(db, 'users', auth.currentUser.uid, 'favorites'),
			where('type', '==', 'news')
		);
		const unsubscribe = onSnapshot(q, (snapshot) => {
			const map = {};
			snapshot.docs.forEach(doc => {
				map[doc.data().itemId] = doc.id;
			});
			setBookmarkedMap(map);
		});
		return unsubscribe;
	}, []);

	const toggleBookmark = (item) => {
		const docId = 'news_' + item.id;
		const ref = doc(db, 'users', auth.currentUser.uid, 'favorites', docId);
		if (bookmarkedMap[item.id]) {
			deleteDoc(ref);
		} else {
			setDoc(ref, {
				type: 'news',
				itemId: item.id,
				title: item.title,
				date: item.date,
				category: item.category,
				content: item.content,
				link: item.link,
				savedAt: serverTimestamp()
			});
		}
	};

	const filteredNews = newsItems.filter(item =>
		item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
		(item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
		item.category.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const rowHeight = useDynamicRowHeight({ defaultRowHeight: 380, key: 'news' });

	const [headerVisible, setHeaderVisible] = useState(true);
	const prevScrollRef = useRef(0);

	const handleScroll = useCallback((e) => {
		const scrollTop = e.currentTarget.scrollTop;
		if (scrollTop > prevScrollRef.current) {
			setHeaderVisible(false);
		} else if (scrollTop < prevScrollRef.current) {
			setHeaderVisible(true);
		}
		prevScrollRef.current = scrollTop;
	}, []);

	if (newsItems.length === 0) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
				<Typography variant="h6" color="error">Нет новостей для отображения</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
			<Box sx={{
				overflow: 'hidden',
				transition: 'max-height 0.2s ease, opacity 0.2s ease, padding-bottom 0.2s ease',
				maxHeight: headerVisible ? 120 : 0,
				opacity: headerVisible ? 1 : 0,
				px: 2,
				pt: 2,
				pb: headerVisible ? 2 : 0
			}}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Typography
						variant="h5"
						sx={{ fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap' }}
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
			</Box>
			<Box sx={{ flex: 1, minHeight: 0 }}>
				{filteredNews.length > 0 ? (
					<List
						rowCount={filteredNews.length}
						rowHeight={rowHeight}
						overscanCount={5}
						rowComponent={NewsRow}
						rowProps={{
							items: filteredNews,
							bookmarkedMap,
							toggleBookmark
						}}
						style={{ height: '100%' }}
						onScroll={handleScroll}
					/>
				) : (
					<Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
						Ничего не найдено
					</Typography>
				)}
			</Box>
		</Box>
	);
}
