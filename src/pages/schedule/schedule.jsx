import React, { useState, useEffect, useRef, useMemo } from 'react';
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
	useTheme,
	Fade,
	Stack
} from "@mui/material";
import { ChevronLeft, ChevronRight, Schedule as ScheduleIcon } from "@mui/icons-material";
import { transformScheduleData } from './schedule-transformer';
import scheduleData from './schedule-data.json';

const Schedule = () => {
	const theme = useTheme();
	const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
	const [currentPair, setCurrentPair] = useState(0);
	const [fadeIn, setFadeIn] = useState(true);
	const tableRef = useRef(null);
	const currentPairRef = useRef(null);
	const [initialLoad, setInitialLoad] = useState(true);

	// Преобразуем данные при загрузке
	const transformedData = useMemo(() => transformScheduleData(scheduleData), []);

	// Время пар
	const pairTimes = [
		[7, 50, 9, 30],   // 1 пара
		[9, 30, 11, 10], // 2 пара
		[11, 10, 12, 50], // 3 пара
		[12, 50, 14, 50], // 4 пара
		[14, 50, 16, 30],  // 5 пара
		[16, 30, 18, 10]  // 6 пара
	];

	// Функция для получения даты в формате YYYY-MM-DD
	const formatDate = (date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	// Генерация дат недели
	const getWeekDates = (offset = 0) => {
		const dates = [];
		const now = new Date();
		const currentDay = now.getDay();
		const monday = new Date(now);

		// Вычисляем понедельник текущей недели
		monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

		// Применяем смещение недели
		monday.setDate(monday.getDate() + offset * 7);

		// Генерируем 6 дней (пн-сб)
		for (let i = 0; i < 6; i++) {
			const date = new Date(monday);
			date.setDate(monday.getDate() + i);
			dates.push(date);
		}

		return dates;
	};

	// Данные для текущей недели
	const weekDates = useMemo(() => getWeekDates(currentWeekOffset), [currentWeekOffset]);

	// Получаем расписание для конкретной даты
	const getDaySchedule = (date) => {
		const dateStr = formatDate(date);
		const dayData = transformedData.find(item => item.date === dateStr);
		return dayData ? dayData.pairs : [];
	};

	// Формируем данные для отображения
	const scheduleDataForWeek = useMemo(() => {
		const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

		return weekDates.map((date, index) => {
			const dateStr = formatDate(date);
			const isToday = formatDate(new Date()) === dateStr;
			const classes = getDaySchedule(date);

			return {
				day: days[index],
				date,
				dateString: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }),
				classes,
				isToday,
				isEmpty: classes.length === 0
			};
		});
	}, [weekDates, transformedData]);

	// Обновление текущей пары
	useEffect(() => {
		const updateCurrentTime = () => {
			const now = new Date();
			let activePair = 0;

			for (let i = 0; i < pairTimes.length; i++) {
				const [startHour, startMinute, endHour, endMinute] = pairTimes[i];
				const startTime = new Date(now);
				startTime.setHours(startHour, startMinute, 0);
				const endTime = new Date(now);
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

	useEffect(() => {
		const scrollToCurrent = () => {
			if (currentPair > 0 && currentPairRef.current) {
				currentPairRef.current.scrollIntoView({
					behavior: 'smooth',
					block: 'center'
				});
			} else {
				const todayRow = tableRef.current?.querySelector('.today-row');
				if (todayRow) {
					todayRow.scrollIntoView({
						behavior: 'smooth',
						block: 'center'
					});
				}
			}
		};

		if (initialLoad) {
			setTimeout(scrollToCurrent, 100);
			setInitialLoad(false);
		}
	}, [currentPair, initialLoad]);

	// Прокрутка к текущей паре или дню
	const scrollToCurrentPair = () => {
		// Если мы не на текущей неделе, сначала переключаемся на неё
		if (currentWeekOffset !== 0) {
			setCurrentWeekOffset(0);
			// Даем время для обновления данных перед прокруткой
			setTimeout(() => {
				scrollToCurrent();
			}, 200);
		} else {
			scrollToCurrent();
		}
	};

	const scrollToCurrent = () => {
		// Пытаемся найти текущую пару
		if (currentPair > 0 && currentPairRef.current) {
			currentPairRef.current.scrollIntoView({
				behavior: 'smooth',
				block: 'center'
			});
		} else {
			// Если пар нет, прокручиваем к текущему дню
			const todayRow = tableRef.current?.querySelector('.today-row');
			if (todayRow) {
				todayRow.scrollIntoView({
					behavior: 'smooth',
					block: 'center'
				});
			}
		}
	};

	// Переключение недель
	const handleWeekChange = (direction) => {
		setFadeIn(false);
		setTimeout(() => {
			setCurrentWeekOffset(prev =>
				direction === 'left' ? Math.min(prev + 1, 1) : Math.max(prev - 1, -1)
			);
			setFadeIn(true);
		}, 150);
	};

	const getWeekLabel = () => {
		if (currentWeekOffset === 0) return 'Текущая неделя';
		return currentWeekOffset > 0 ? 'Следующая неделя' : 'Прошлая неделя';
	};

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
				Расписание
			</Typography>

			<Fade in={fadeIn} key={currentWeekOffset}>
				<TableContainer component={Paper} ref={tableRef}>
					<Table>
						<TableBody>
							{scheduleDataForWeek.map(({ day, dateString, classes, isToday, isEmpty }) => (
								<React.Fragment key={day + dateString}>
									<TableRow className={isToday ? 'today-row' : ''} sx={{
										bgcolor: isToday ? 'rgba(76, 175, 80, 0.08)' : 'action.hover',
										'& .MuiTableCell-root': { borderBottom: 'none' }
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

									{isEmpty ? (
										<TableRow>
											<TableCell colSpan={3} sx={{ textAlign: 'center', py: 2 }}>
												<Typography variant="body2" color="text.secondary">
													Нет занятий
												</Typography>
											</TableCell>
										</TableRow>
									) : (
										classes.map((cls) => (
											<TableRow
												key={cls.number}
												ref={isToday && cls.number === currentPair ? currentPairRef : null}
												sx={{
													bgcolor: isToday && cls.number === currentPair ? 'primary.main' :
														isToday ? 'rgba(76, 175, 80, 0.04)' : 'inherit',
													color: isToday && cls.number === currentPair ? 'primary.contrastText' : 'inherit',
													'&:last-child td': { borderBottom: isToday ? 'none' : 'inherit' }
												}}
											>
												<TableCell width={60} align="center">
													{cls.number}
												</TableCell>
												<TableCell>
													<Typography fontWeight="medium">
														{cls.subject}
													</Typography>
													<Typography variant="body2" color={isToday && cls.number === currentPair ? 'primary.contrastText' : 'text.secondary'}>
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
										))
									)}
								</React.Fragment>
							))}
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
						'&.Mui-disabled': { opacity: 0.5 },
						'&:focus': { outline: 'none' }
					}}
				>
					<ChevronLeft />
				</Fab>

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

				<Fab
					color="primary"
					size="small"
					onClick={() => handleWeekChange('left')}
					disabled={currentWeekOffset === 1}
					sx={{
						'&.Mui-disabled': { opacity: 0.5 },
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
