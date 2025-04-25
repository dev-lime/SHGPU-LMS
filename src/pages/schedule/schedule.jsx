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

// Константа для UTC+5 (Екатеринбург)
const TIMEZONE_OFFSET = 5 * 60 * 60 * 1000; // 5 часов в миллисекундах

const Schedule = () => {
	const theme = useTheme();
	const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
	const [currentPair, setCurrentPair] = useState(0);
	const [fadeIn, setFadeIn] = useState(true);
	const [initialLoad, setInitialLoad] = useState(true);
	const tableRef = useRef(null);
	const currentPairRef = useRef(null);
	const todayRowRef = useRef(null);

	const transformedData = useMemo(() => transformScheduleData(scheduleData), []);

	const pairTimes = [
		[7, 50, 9, 30],    // 1 пара
		[9, 30, 11, 10],   // 2 пара
		[11, 10, 12, 50],  // 3 пара
		[12, 50, 14, 50],  // 4 пара
		[14, 50, 16, 30],  // 5 пара
		[16, 30, 18, 10]   // 6 пара
	];

	// Функция для получения текущей даты в UTC+5
	const getCurrentDate = () => {
		const now = new Date();
		return new Date(now.getTime() + TIMEZONE_OFFSET);
	};

	// Форматирование даты в YYYY-MM-DD с учетом UTC+5
	const formatDate = (date) => {
		const year = date.getUTCFullYear();
		const month = String(date.getUTCMonth() + 1).padStart(2, '0');
		const day = String(date.getUTCDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	// Генерация дат недели с учетом UTC+5
	const getWeekDates = (offset = 0) => {
		const now = getCurrentDate();
		const currentDay = now.getUTCDay(); // 0 (воскресенье) до 6 (суббота)
		const monday = new Date(now);

		// Для воскресенья показываем следующую неделю
		if (currentDay === 0) {
			monday.setUTCDate(now.getUTCDate() + 1); // Следующий день (понедельник)
		} else {
			monday.setUTCDate(now.getUTCDate() - (currentDay - 1)); // Текущий понедельник
		}

		// Применяем смещение недели
		monday.setUTCDate(monday.getUTCDate() + offset * 7);

		// Генерируем 6 дней (пн-сб)
		return Array.from({ length: 6 }, (_, i) => {
			const date = new Date(monday);
			date.setUTCDate(monday.getUTCDate() + i);
			return date;
		});
	};

	const weekDates = useMemo(() => getWeekDates(currentWeekOffset), [currentWeekOffset]);

	const getDaySchedule = (date) => {
		const dateStr = formatDate(date);
		const dayData = transformedData.find(item => item.date === dateStr);
		return dayData ? dayData.pairs : [];
	};

	const scheduleDataForWeek = useMemo(() => {
		const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
		const currentDateStr = formatDate(getCurrentDate());

		return weekDates.map((date, index) => {
			const dateStr = formatDate(date);
			const isToday = currentDateStr === dateStr;
			const classes = getDaySchedule(date);

			return {
				day: days[index],
				date,
				dateString: date.toLocaleDateString('ru-RU', {
					timeZone: 'Asia/Yekaterinburg',
					day: 'numeric',
					month: 'long'
				}),
				classes,
				isToday,
				isEmpty: classes.length === 0
			};
		});
	}, [weekDates, transformedData]);

	// Определение текущей пары с учетом UTC+5
	useEffect(() => {
		const updateCurrentTime = () => {
			const now = getCurrentDate();
			let activePair = 0;

			for (let i = 0; i < pairTimes.length; i++) {
				const [startHour, startMinute, endHour, endMinute] = pairTimes[i];

				const startTime = new Date(now);
				startTime.setUTCHours(startHour, startMinute, 0, 0);

				const endTime = new Date(now);
				endTime.setUTCHours(endHour, endMinute, 0, 0);

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

	// Прокрутка к текущей паре/дню
	const scrollToCurrent = () => {
		if (currentPair > 0 && currentPairRef.current) {
			currentPairRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
		} else if (todayRowRef.current) {
			todayRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	};

	useEffect(() => {
		if (initialLoad) {
			setTimeout(scrollToCurrent, 100);
			setInitialLoad(false);
		}
	}, [currentPair, initialLoad]);

	const scrollToCurrentPair = () => {
		if (currentWeekOffset !== 0) {
			setCurrentWeekOffset(0);
			setTimeout(scrollToCurrent, 200);
		} else {
			scrollToCurrent();
		}
	};

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
									<TableRow
										className={isToday ? 'today-row' : ''}
										ref={isToday ? todayRowRef : null}
										sx={{
											bgcolor: isToday ? 'rgba(76, 175, 80, 0.08)' : 'action.hover',
											'& .MuiTableCell-root': { borderBottom: 'none' }
										}}
									>
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
										<TableRow
											sx={{
												bgcolor: isToday ? 'rgba(76, 175, 80, 0.04)' : 'inherit',
												'&:last-child td': { borderBottom: isToday ? 'none' : 'inherit' }
											}}
										>
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
