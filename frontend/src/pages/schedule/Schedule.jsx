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
	Stack
} from "@mui/material";
import { ChevronLeft, ChevronRight, Schedule as ScheduleIcon } from "@mui/icons-material";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { transformScheduleData } from './scheduleTransformer';
import scheduleData from './schedule-data.json';
import useProfile from '@hooks/useProfile';

// Константа для UTC+5 (Екатеринбург)
const TIMEZONE_OFFSET = 5 * 60 * 60 * 1000; // 5 часов в миллисекундах

const Schedule = () => {
	const theme = useTheme();
	const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
	const [currentPair, setCurrentPair] = useState(0);
	const [initialLoad, setInitialLoad] = useState(true);
	const tableRef = useRef(null);
	const currentPairRef = useRef(null);
	const todayRowRef = useRef(null);
	const { userData } = useProfile();
	const studentGroup = userData?.accountType === 'student' ? userData.studentGroup : null;
	const controls = useAnimation();
	const [isDragging, setIsDragging] = useState(false);
	// Состояние для хранения прогресса текущей пары
	const [currentPairProgress, setCurrentPairProgress] = useState(0);
	// Состояние для хранения следующей пары (для выделения на перемене)
	const [nextPair, setNextPair] = useState(null);

	const transformedData = useMemo(() => transformScheduleData(scheduleData), []);

	const pairTimes = [
		[8, 0, 9, 30],		// 1 пара
		[9, 40, 11, 10],	// 2 пара
		[11, 20, 12, 50],	// 3 пара
		[13, 20, 14, 50],	// 4 пара
		[15, 0, 16, 30],	// 5 пара
		[16, 40, 18, 10],	// 6 пара
	];

	// Обработчик клика по преподавателю
	const handleTeacherClick = (teacherName, e) => {
		e.stopPropagation();
		console.log(`Нажат преподаватель: ${teacherName}`);
	};

	// Обработчик клика по аудитории
	const handleRoomClick = (roomNumber, e) => {
		e.stopPropagation();
		console.log(`Нажата аудитория: ${roomNumber}`);
	};

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

		return weekDates.map((date, index) => {
			const dateStr = formatDate(date);
			const currentDateStr = formatDate(getCurrentDate());
			const isToday = currentDateStr === dateStr;
			const classes = getDaySchedule(date);

			const dayData = transformedData.find(item => item.date === dateStr);
			const jsonDate = dayData ? new Date(dayData.date) : date;

			return {
				day: days[index],
				date: jsonDate,
				dateString: jsonDate.toLocaleDateString('ru-RU', {
					timeZone: 'UTC',
					day: 'numeric',
					month: 'long'
				}),
				classes,
				isToday,
				isEmpty: classes.length === 0
			};
		});
	}, [weekDates, transformedData]);

	// Определение текущей и следующей пары с учетом UTC+5
	useEffect(() => {
		const updateCurrentTime = () => {
			const now = getCurrentDate();
			let activePair = 0;
			let nextPair = null;

			for (let i = 0; i < pairTimes.length; i++) {
				const [startHour, startMinute, endHour, endMinute] = pairTimes[i];

				const startTime = new Date(now);
				startTime.setUTCHours(startHour, startMinute, 0, 0);

				const endTime = new Date(now);
				endTime.setUTCHours(endHour, endMinute, 0, 0);

				if (now >= startTime && now <= endTime) {
					activePair = i + 1;
					// Рассчитываем прогресс текущей пары
					const totalDuration = endTime - startTime;
					const elapsed = now - startTime;
					const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
					setCurrentPairProgress(progress);
					break;
				} else if (now < startTime && !nextPair) {
					nextPair = i + 1;
				}
			}

			setCurrentPair(activePair);
			setNextPair(activePair === 0 ? nextPair : null);
		};

		updateCurrentTime();
		const interval = setInterval(updateCurrentTime, 1000); // Обновляем каждую секунду
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

	const handleWeekChange = async (direction) => {
		const newOffset = direction === 'left'
			? Math.min(currentWeekOffset + 1, 1)
			: Math.max(currentWeekOffset - 1, -1);

		if (newOffset === currentWeekOffset) return;

		// Анимация смахивания
		await controls.start({
			x: direction === 'left' ? -100 : 100,
			opacity: 0,
			transition: { duration: 0.2 }
		});

		setCurrentWeekOffset(newOffset);

		controls.set({
			x: direction === 'left' ? 100 : -100,
			opacity: 0
		});

		controls.start({
			x: 0,
			opacity: 1,
			transition: { duration: 0.3 }
		});
	};

	const handleDragStart = () => {
		setIsDragging(true);
	};

	const handleDragEnd = async (event, info) => {
		setIsDragging(false);
		const offset = info.offset.x;
		const velocity = info.velocity.x;

		// Определяем порог срабатывания свайпа
		const swipeThreshold = window.innerWidth * 0.2; // 20% ширины экрана
		const velocityThreshold = 500;

		if (offset > swipeThreshold || velocity > velocityThreshold) {
			// Свайп вправо - предыдущая неделя
			await handleWeekChange('right');
		} else if (offset < -swipeThreshold || velocity < -velocityThreshold) {
			// Свайп влево - следующая неделя
			await handleWeekChange('left');
		}
	};

	const handleTap = (e) => {
		if (isDragging) {
			e.preventDefault();
			e.stopPropagation();
		}
	};

	const getWeekLabel = () => {
		if (currentWeekOffset === 0) return 'Текущая неделя';
		return currentWeekOffset > 0 ? 'Следующая неделя' : 'Прошлая неделя';
	};

	const renderWeekSchedule = () => (
		<motion.div
			key={currentWeekOffset}
			initial={{ x: 0, opacity: 1 }}
			animate={controls}
			drag="x"
			dragConstraints={{ left: 0, right: 0 }}
			dragElastic={0.2}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onTap={handleTap}
			style={{
				width: '100%',
				touchAction: 'pan-y',
				userSelect: 'none',
				WebkitUserSelect: 'none'
			}}
		>
			<TableContainer
				component={Paper}
				ref={tableRef}
				sx={{
					touchAction: 'pan-y',
					userSelect: 'none',
					WebkitUserSelect: 'none',
					position: 'relative'
				}}
			>
				<Table sx={{ position: 'relative' }}>
					<TableBody>
						{scheduleDataForWeek.map(({ day, dateString, classes, isToday, isEmpty }) => (
							<React.Fragment key={day + dateString}>
								<TableRow
									className={isToday ? 'today-row' : ''}
									ref={isToday ? todayRowRef : null}
									sx={{
										bgcolor: isToday ? theme.palette.tones[2] : 'action.hover',
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
											bgcolor: isToday ? theme.palette.tones[1] : 'inherit',
											'&:last-child td': { borderBottom: isToday ? 'none' : 'inherit' }
										}}
									>
										<TableCell colSpan={3} sx={{ textAlign: 'center', py: 2 }}>
											<Typography variant="body2" color="theme.palette.tones[1].contrastText">
												Нет занятий
											</Typography>
										</TableCell>
									</TableRow>
								) : (
									classes.map((cls) => {
										const isCurrentPair = isToday && cls.number === currentPair;
										const isNextPair = isToday && nextPair === cls.number;

										return (
											<TableRow
												key={cls.number}
												ref={(isCurrentPair || isNextPair) ? currentPairRef : null}
												sx={{
													bgcolor: isCurrentPair ? 'primary.main' :
														isNextPair ? 'primary.main' :
															isToday ? theme.palette.tones[1] : 'inherit',
													color: isCurrentPair ? 'primary.contrastText' : 'inherit',
													'&:last-child td': { borderBottom: isToday ? 'none' : 'inherit' },
													position: 'relative',
													'&::after': isCurrentPair ? {
														content: '""',
														position: 'absolute',
														top: 0,
														left: 0,
														height: '100%',
														width: `${currentPairProgress}%`,
														backgroundColor: theme.palette.primary.dark,
														zIndex: 0,
														transition: 'width 1s linear'
													} : {}
												}}
											>
												<TableCell
													align="center"
													sx={{
														width: '40px',
														padding: '0px 10px',
														textAlign: 'right',
														position: 'relative',
														zIndex: 1
													}}>
													{cls.number}
												</TableCell>
												<TableCell sx={{ position: 'relative', zIndex: 1 }}>
													<Typography fontWeight="medium">
														{cls.subject}
													</Typography>
													<Typography
														variant="body2"
														color={isCurrentPair ? 'primary.contrastText' : 'text.secondary'}
														onClick={(e) => handleTeacherClick(cls.teachers, e)}
														sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
													>
														{cls.teachers}
													</Typography>
												</TableCell>
												<TableCell width={120} sx={{ position: 'relative', zIndex: 1 }}>
													<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
														<Typography>{cls.type}</Typography>
														<Typography
															onClick={(e) => handleRoomClick(cls.room, e)}
															sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
														>
															{cls.room}
														</Typography>
													</Box>
												</TableCell>
											</TableRow>
										);
									})
								)}
							</React.Fragment>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</motion.div>
	);

	return (
		<Box
			sx={{
				p: 2,
				overflowX: 'hidden',
				position: 'relative',
				pb: 16,
				maxWidth: 450,
				margin: '0 auto',
				width: '100%',
				touchAction: 'pan-y'
			}}
		>
			<Typography variant="h5" sx={{ mb: 2 }}>
				Расписание {studentGroup && `для ${studentGroup}`}
			</Typography>

			<AnimatePresence mode="wait">
				{renderWeekSchedule()}
			</AnimatePresence>

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
					zIndex: 1000
				}}
				onClick={scrollToCurrentPair}
			>
				<ScheduleIcon />
			</Fab>
		</Box>
	);
};

export default Schedule;
