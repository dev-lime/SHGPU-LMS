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
	useMediaQuery,
	useTheme,
	Fade,
	Stack
} from "@mui/material";
import { ChevronLeft, ChevronRight, Schedule as ScheduleIcon } from "@mui/icons-material";

const Schedule = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
	const [currentDay, setCurrentDay] = useState(new Date().getDay());
	const [currentPair, setCurrentPair] = useState(0);
	const [initialLoad, setInitialLoad] = useState(true);
	const [fadeIn, setFadeIn] = useState(true);
	const tableRef = useRef(null);
	const currentPairRef = useRef(null);

	// Время пар
	const pairTimes = [
		[7, 50, 9, 30],   // 1 пара
		[9, 30, 11, 10], // 2 пара
		[11, 10, 12, 50], // 3 пара
		[12, 50, 14, 50], // 4 пара
		[14, 50, 16, 30],  // 5 пара
		[16, 30, 18, 10]  // 6 пара
	];

	// Генерация дат недели с мемоизацией
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

	const scrollToCurrentPair = () => {
		if (currentWeekOffset !== 0) {
			setCurrentWeekOffset(0);
			setTimeout(() => {
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
			});
		} else {
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
		}
	};

	const isCurrentDay = (date) => {
		const now = new Date();
		return (
			now.getDate() === date.getDate() &&
			now.getMonth() === date.getMonth() &&
			now.getFullYear() === date.getFullYear()
		);
	};

	const generateDaySchedule = (dayIndex) => {
		const subjects = [
			{
				num: 1,
				teacher: "Слинкин Д.А.",
				name: "Структуры и алгоритмы обработки данных",
				type: "п5",
				room: "219А"
			},
			{
				num: 2,
				teacher: "Попова Е.И.",
				name: "Экономика",
				type: "л14",
				room: "313В"
			},
			{
				num: 3,
				teacher: "Пирогов В.Ю.",
				name: "Информационные системы",
				type: "л4",
				room: "235А"
			},
			{
				num: 4,
				teacher: "Баландина И.В.",
				name: "Налоги и налогообложение",
				type: "с4",
				room: "214В"
			},
			{
				num: 5,
				teacher: "Иванов А.Б.",
				name: "Иностранный язык",
				type: "п3",
				room: "105Г"
			},
			{
				num: 6,
				teacher: "Петрова С.Д.",
				name: "Физическая культура",
				type: "п2",
				room: "Спортзал"
			}
		];

		return subjects.slice(0, 3 + dayIndex % 3);
	};

	// Мемоизированные данные расписания
	const scheduleData = useMemo(() => {
		const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

		return days.map((day, index) => {
			const date = weekDates[index];
			const dateString = date ? date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) : '';

			return {
				day,
				date,
				dateString,
				classes: generateDaySchedule(index),
				isCurrent: date ? isCurrentDay(date) : false
			};
		});
	}, [weekDates]);

	const handleWeekChange = (direction) => {
		setFadeIn(false);
		setTimeout(() => {
			setCurrentWeekOffset(prev => {
				const newWeek = direction === 'left' ? Math.min(prev + 1, 1) : Math.max(prev - 1, -1);
				return newWeek;
			});
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
							{scheduleData.map(({ day, dateString, classes, isCurrent, date }) => {
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
											const isCurrentPair = isToday && cls.num === currentPair;
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
														{cls.num}
													</TableCell>
													<TableCell>
														<Typography fontWeight="medium">
															{cls.name}
														</Typography>
														<Typography variant="body2" color={isCurrentPair ? 'primary.contrastText' : 'text.secondary'}>
															{cls.teacher}
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

			{/* Группа FAB кнопок внизу слева */}
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
						}
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
						}
					}}
				>
					<ChevronRight />
				</Fab>
			</Stack>

			{/* FAB кнопка для перехода к текущей паре (справа) */}
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
