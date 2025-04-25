import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableRow,
	Typography,
	Box,
	Paper,
	TableContainer,
	Fab,
	useMediaQuery,
	useTheme,
	Fade,
	Stack,
	CircularProgress,
	Alert
} from "@mui/material";
import { ChevronLeft, ChevronRight, Schedule as ScheduleIcon } from "@mui/icons-material";
import { auth, db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useScheduleAPI } from './useScheduleAPI';
import { transformScheduleData } from './scheduleTransformer';
import _ from 'lodash';

const Schedule = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
	const [currentDay, setCurrentDay] = useState(new Date().getDay());
	const [currentPair, setCurrentPair] = useState(0);
	const [initialLoad, setInitialLoad] = useState(true);
	const [fadeIn, setFadeIn] = useState(true);
	const [userData, setUserData] = useState(null);
	const [scheduleCache, setScheduleCache] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const tableRef = useRef(null);
	const currentPairRef = useRef(null);
	const { getPairs, loading: apiLoading, error: apiError } = useScheduleAPI();

	// Время пар
	const pairTimes = [
		[7, 50, 9, 30],   // 1 пара
		[9, 30, 11, 10], // 2 пара
		[11, 10, 12, 50], // 3 пара
		[12, 50, 14, 50], // 4 пара
		[14, 50, 16, 30],  // 5 пара
		[16, 30, 18, 10]  // 6 пара
	];

	// 1. Подписка на данные пользователя с кешированием
	useEffect(() => {
		if (!auth.currentUser) return;

		// Проверяем локальное хранилище
		const cachedData = localStorage.getItem('userData');
		if (cachedData) {
			setUserData(JSON.parse(cachedData));
			setLoading(false);
		}

		// Устанавливаем подписку на изменения
		const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
			if (doc.exists()) {
				const data = { ...doc.data(), timestamp: Date.now() };
				localStorage.setItem('userData', JSON.stringify(data));
				setUserData(data);
				setLoading(false);
			}
		});

		return () => unsubscribe();
	}, []);

	// 2. Загрузка расписания с кешированием
	const loadSchedule = useCallback(async (date) => {
		if (!userData?.studentGroup) return;

		const cacheKey = `${userData.studentGroup}_${date}`;

		// Проверяем кеш
		if (scheduleCache[cacheKey]) {
			return scheduleCache[cacheKey];
		}

		setLoading(true);
		try {
			const data = await getPairs(date, true, { groupName: userData.studentGroup.toLowerCase() });
			const transformed = transformScheduleData(data);

			setScheduleCache(prev => ({
				...prev,
				[cacheKey]: transformed
			}));

			return transformed;
		} catch (err) {
			console.error('Ошибка загрузки расписания:', err);
			setError('Ошибка загрузки расписания');
			return null;
		} finally {
			setLoading(false);
		}
	}, [userData, scheduleCache, getPairs]);

	// 3. Генерация дат недели с мемоизацией
	const weekDates = useMemo(() => {
		const dates = [];
		const now = new Date();
		const monday = new Date(now);
		const offset = now.getDay() === 0 ? -6 : 1 - now.getDay();
		monday.setDate(now.getDate() + offset + currentWeekOffset * 7);

		for (let i = 0; i < 6; i++) {
			const date = new Date(monday);
			date.setDate(monday.getDate() + i);
			dates.push(date);
		}

		return dates;
	}, [currentWeekOffset]);

	// 4. Загрузка расписания при изменении недели
	useEffect(() => {
		if (!userData?.studentGroup) return;

		const loadData = async () => {
			const monday = weekDates[0];
			const dateStr = monday.toISOString().split('T')[0];
			await loadSchedule(dateStr);
		};

		loadData();
	}, [weekDates, userData, loadSchedule]);

	// 5. Определение текущей пары
	useEffect(() => {
		const updateCurrentTime = () => {
			const now = new Date();
			const day = now.getDay();
			setCurrentDay(day === 0 ? 6 : day - 1);

			let activePair = 0;
			for (let i = 0; i < pairTimes.length; i++) {
				const [startHour, startMinute, endHour, endMinute] = pairTimes[i];
				const startTime = new Date();
				startTime.setHours(startHour, startMinute, 0);
				const endTime = new Date();
				endTime.setHours(endHour, endMinute, 0);

				if (now >= startTime && now <= endTime) {
					activePair = i + 1;
					break;
				}
			}
			setCurrentPair(activePair);
		};

		updateCurrentTime();
		const interval = setInterval(updateCurrentTime, 60000);
		return () => clearInterval(interval);
	}, []);

	// 6. Прокрутка к текущей паре
	useEffect(() => {
		if (initialLoad && currentPair > 0 && currentPairRef.current) {
			setTimeout(() => {
				if (currentPairRef.current) {
					currentPairRef.current.scrollIntoView({
						behavior: 'smooth',
						block: 'center'
					});
				}
			});
			setInitialLoad(false);
		}
	}, [currentPair, initialLoad]);

	// 7. Оптимизированные обработчики
	const isCurrentDay = useCallback((date) => {
		const now = new Date();
		return (
			now.getDate() === date.getDate() &&
			now.getMonth() === date.getMonth() &&
			now.getFullYear() === date.getFullYear()
		);
	}, []);

	const handleWeekChange = useCallback(_.debounce((direction) => {
		setFadeIn(false);
		setTimeout(() => {
			setCurrentWeekOffset(prev => {
				const newWeek = direction === 'left' ? Math.min(prev + 1, 1) : Math.max(prev - 1, -1);
				return newWeek;
			});
			setFadeIn(true);
		}, 150);
	}, 300), []);

	const scrollToCurrentPair = useCallback(() => {
		if (currentWeekOffset !== 0) {
			setCurrentWeekOffset(0);
			setTimeout(() => {
				if (currentPair > 0 && currentPairRef.current) {
					currentPairRef.current.scrollIntoView({
						behavior: 'smooth',
						block: 'center'
					});
				}
			});
		} else if (currentPair > 0 && currentPairRef.current) {
			currentPairRef.current.scrollIntoView({
				behavior: 'smooth',
				block: 'center'
			});
		}
	}, [currentWeekOffset, currentPair]);

	// 8. Получение расписания на день
	const getDaySchedule = useCallback((date) => {
		const dateStr = date.toISOString().split('T')[0];
		const cacheKey = `${userData?.studentGroup}_${dateStr}`;
		const weekData = scheduleCache[cacheKey];

		return weekData?.find(item => item.date === dateStr)?.pairs || [];
	}, [userData, scheduleCache]);

	// 9. Мемоизированные данные для отображения
	const scheduleDataForWeek = useMemo(() => {
		const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

		return days.map((day, index) => {
			const date = weekDates[index];
			const dateString = date ? date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) : '';
			const classes = date ? getDaySchedule(date) : [];

			return {
				day,
				date,
				dateString,
				classes,
				isCurrent: date ? isCurrentDay(date) : false
			};
		});
	}, [weekDates, getDaySchedule, isCurrentDay]);

	const getWeekLabel = useCallback(() => {
		if (currentWeekOffset === 0) return 'Текущая неделя';
		return currentWeekOffset > 0 ? 'Следующая неделя' : 'Прошлая неделя';
	}, [currentWeekOffset]);

	// Отображение состояния загрузки
	if (loading || apiLoading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
				<CircularProgress />
			</Box>
		);
	}

	// Отображение ошибок
	if (error || apiError) {
		return (
			<Box sx={{ p: 2 }}>
				<Alert severity="error">{error || apiError}</Alert>
			</Box>
		);
	}

	// Проверка группы пользователя
	if (!userData?.studentGroup) {
		return (
			<Box sx={{ p: 2 }}>
				<Alert severity="info">
					Не удалось определить вашу группу. Пожалуйста, проверьте ваш профиль.
				</Alert>
			</Box>
		);
	}

	return (
		<Box sx={{
			p: 2,
			overflowX: 'hidden',
			position: 'relative',
			pb: 16,
			maxWidth: 450,
			margin: '0 auto',
			width: '100%'
		}}>
			<Typography variant="h5" sx={{ mb: 2 }}>
				Расписание {userData.studentGroup}
			</Typography>

			<Fade in={fadeIn} key={currentWeekOffset}>
				<TableContainer component={Paper} ref={tableRef}>
					<Table>
						<TableBody>
							{scheduleDataForWeek.map(({ day, dateString, classes, isCurrent, date }) => {
								const isToday = date ? isCurrentDay(date) : false;

								return (
									<React.Fragment key={day + dateString}>
										<TableRow className={isToday ? 'today-row' : ''} sx={{
											bgcolor: isToday ? 'rgba(76, 175, 80, 0.08)' : 'action.hover',
											'& .MuiTableCell-root': {
												borderBottom: 'none'
											}
										}}>
											<TableCell colSpan={3}>
												<Typography fontWeight="bold">
													{day}, {dateString}
													{isToday && (
														<Typography component="span" variant="body2" color="primary" sx={{ ml: 1 }}>
															(сегодня)
														</Typography>
													)}
												</Typography>
											</TableCell>
										</TableRow>

										{classes.map((cls, idx) => {
											const isCurrentPair = isToday && cls.number === currentPair;
											return (
												<TableRow
													key={idx}
													ref={isCurrentPair ? currentPairRef : null}
													sx={{
														bgcolor: isCurrentPair ? 'primary.main' :
															isToday ? 'rgba(76, 175, 80, 0.04)' : 'inherit',
														color: isCurrentPair ? 'primary.contrastText' : 'inherit',
														'&:last-child td': {
															borderBottom: isToday ? 'none' : 'inherit'
														}
													}}
												>
													<TableCell width={60} align="center">
														{cls.number}
													</TableCell>
													<TableCell>
														<Typography fontWeight="medium">
															{cls.subject}
														</Typography>
														<Typography variant="body2" color={isCurrentPair ? 'primary.contrastText' : 'text.secondary'}>
															{cls.teachers}
														</Typography>
													</TableCell>
													<TableCell width={120}>
														<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
															<Typography>{cls.type}</Typography>
															<Typography>{cls.room}</Typography>
														</Box>
													</TableCell>
												</TableRow>
											);
										})}
									</React.Fragment>
								);
							})}
						</TableBody>
					</Table>
				</TableContainer>
			</Fade>

			<Stack
				direction="row"
				spacing={1}
				sx={{
					position: 'fixed',
					left: 16,
					bottom: 80,
					zIndex: 1000,
					alignItems: 'center',
					bgcolor: 'background.paper',
					borderRadius: 4,
					p: 1,
					boxShadow: 3
				}}
			>
				<Fab
					color="primary"
					size="small"
					onClick={() => handleWeekChange('right')}
					disabled={currentWeekOffset === -1}
					sx={{
						'&.Mui-disabled': {
							opacity: 0.5
						},
						'&.Mui-selected': { outline: 'none' },
						'&:focus': { outline: 'none' }
					}}
				>
					<ChevronLeft />
				</Fab>

				<Fade in={fadeIn}>
					<Typography
						variant="body2"
						sx={{
							px: 1,
							minWidth: 120,
							textAlign: 'center',
							fontWeight: 'medium'
						}}
					>
						{getWeekLabel()}
					</Typography>
				</Fade>

				<Fab
					color="primary"
					size="small"
					onClick={() => handleWeekChange('left')}
					disabled={currentWeekOffset === 1}
					sx={{
						'&.Mui-disabled': {
							opacity: 0.5
						},
						'&.Mui-selected': { outline: 'none' },
						'&:focus': { outline: 'none' }
					}}
				>
					<ChevronRight />
				</Fab>
			</Stack>

			<Fab
				color="primary"
				aria-label="current-pair"
				sx={{
					position: 'fixed',
					bottom: 80,
					right: 16,
					zIndex: 1000,
					'&.Mui-selected': { outline: 'none' },
					'&:focus': { outline: 'none' }
				}}
				onClick={scrollToCurrentPair}
			>
				<ScheduleIcon />
			</Fab>
		</Box>
	);
};

export default Schedule;
