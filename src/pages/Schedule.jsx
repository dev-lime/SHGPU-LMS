import React, { useState, useEffect } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableRow,
	Typography,
	Box,
	IconButton,
	Paper,
	TableContainer
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

const Schedule = () => {
	const [currentWeek, setCurrentWeek] = useState(0);
	const [currentDay, setCurrentDay] = useState(new Date().getDay());
	const [currentPair, setCurrentPair] = useState(0);
	const [weekDates, setWeekDates] = useState([]);

	// Время пар
	const pairTimes = [
		[7, 50, 9, 30],   // 1 пара
		[9, 30, 11, 10], // 2 пара
		[11, 10, 12, 50], // 3 пара
		[12, 50, 14, 50], // 4 пара
		[14, 50, 16, 30],  // 5 пара
		[16, 30, 18, 10]  // 6 пара
	];

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
		const generateWeekDates = () => {
			const dates = [];
			const now = new Date();
			let currentDayOfWeek = now.getDay(); // 0 - воскресенье, 1 - понедельник, ..., 6 - суббота
		
			// Если сегодня воскресенье, то считаем, что уже началась следующая неделя
			if (currentDayOfWeek === 0) {
				now.setDate(now.getDate() + 1); // Перемещаемся на понедельник следующей недели
			}
		
			// Находим понедельник текущей (или следующей, если воскресенье) недели
			const monday = new Date(now);
			const offset = now.getDay() === 0 ? -6 : 1 - now.getDay(); // для понедельника будет 0
			monday.setDate(now.getDate() + offset + currentWeek * 7);
		
			for (let i = 0; i < 6; i++) {
				const date = new Date(monday);
				date.setDate(monday.getDate() + i);
				dates.push(date);
			}
		
			return dates;
		};

		setWeekDates(generateWeekDates());
	}, [currentWeek]);

	const isCurrentDay = (date) => {
		const now = new Date();
		return (
			now.getDate() === date.getDate() &&
			now.getMonth() === date.getMonth() &&
			now.getFullYear() === date.getFullYear()
		);
	};

	const generateScheduleData = () => {
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

	const scheduleData = generateScheduleData();

	const handlePrevWeek = () => setCurrentWeek(prev => prev - 1);
	const handleNextWeek = () => setCurrentWeek(prev => prev + 1);

	const formatWeekRange = () => {
		if (weekDates.length < 2) return '';

		const startDate = weekDates[0];
		const endDate = weekDates[5];

		const startStr = startDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
		const endStr = endDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

		return `${startStr} - ${endStr}`;
	};

	return (
		<Box sx={{ p: 2, overflowX: 'hidden' }}>
			<Box sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				mb: 2,
				flexWrap: 'nowrap'
			}}>
				<Typography variant="h5" sx={{ mr: 2 }}>
					Расписание
				</Typography>

				<Box sx={{
					display: 'flex',
					alignItems: 'center',
					minWidth: 'fit-content'
				}}>
					<IconButton onClick={handlePrevWeek} size="small">
						<ChevronLeft fontSize="small" />
					</IconButton>
					<Typography component="span" sx={{
						mx: 1,
						fontSize: '0.9rem',
						whiteSpace: 'nowrap'
					}}>
						{currentWeek === 0 ? 'Текущая неделя' : formatWeekRange()}
					</Typography>
					<IconButton onClick={handleNextWeek} size="small">
						<ChevronRight fontSize="small" />
					</IconButton>
				</Box>
			</Box>

			<TableContainer component={Paper}>
				<Table>
					<TableBody>
						{scheduleData.map(({ day, dateString, classes, isCurrent, date }) => {
							const isToday = date ? isCurrentDay(date) : false;

							return (
								<React.Fragment key={day + dateString}>
									<TableRow sx={{
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

									{classes.map((cls, idx) => (
										<TableRow
											key={idx}
											sx={{
												bgcolor: isToday && cls.num === currentPair ? 'primary.main' :
													isToday ? 'rgba(76, 175, 80, 0.04)' : 'inherit',
												color: isToday && cls.num === currentPair ? 'primary.contrastText' : 'inherit',
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
												<Typography variant="body2" color="text.secondary">
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
									))}
								</React.Fragment>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
};

export default Schedule;
