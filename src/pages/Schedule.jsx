import React, { useState } from 'react';
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

	// Определяем текущее время и номер пары
	const now = new Date();
	const currentHour = now.getHours();
	const currentPair = currentHour >= 8 && currentHour < 10 ? 1 :
		currentHour >= 10 && currentHour < 12 ? 2 :
			currentHour >= 12 && currentHour < 14 ? 3 :
				currentHour >= 14 && currentHour < 16 ? 4 :
					currentHour >= 16 && currentHour < 18 ? 5 : 0;

	const isCurrentDay = (date) => {
		const compareDate = new Date(date);
		return (
			now.getDate() === compareDate.getDate() &&
			now.getMonth() === compareDate.getMonth() &&
			now.getFullYear() === compareDate.getFullYear()
		);
	};

	const generateScheduleData = (weekOffset) => {
		const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
		const baseDate = new Date();
		baseDate.setDate(baseDate.getDate() + weekOffset * 7);

		return days.map((day, index) => {
			const date = new Date(baseDate);
			date.setDate(baseDate.getDate() + index);

			return {
				day,
				date,
				dateString: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }),
				classes: generateDaySchedule(index),
				isCurrent: isCurrentDay(date)
			};
		});
	};

	const generateDaySchedule = (dayIndex) => {
		const subjects = [
			{
				num: 2,
				teacher: "Слинкин Д.А.",
				name: "Структуры и алгоритмы обработки данных",
				type: "п5",
				room: "219А"
			},
			{
				num: 3,
				teacher: "Попова Е.И.",
				name: "Экономика",
				type: "л14",
				room: "313В"
			},
			{
				num: 4,
				teacher: "Пирогов В.Ю.",
				name: "Информационные системы",
				type: "л4",
				room: "235А"
			},
			{
				num: 5,
				teacher: "Баландина И.В.",
				name: "Налоги и налогообложение",
				type: "с4",
				room: "214В"
			}
		];

		return subjects.slice(0, 3 + dayIndex % 2);
	};

	const scheduleData = generateScheduleData(currentWeek);

	const handlePrevWeek = () => setCurrentWeek(prev => prev - 1);
	const handleNextWeek = () => setCurrentWeek(prev => prev + 1);

	return (
		<Box sx={{ p: 2 }}>
			<Box sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				mb: 2
			}}>
				<Typography variant="h5">Расписание</Typography>

				<Box>
					<IconButton onClick={handlePrevWeek}>
						<ChevronLeft />
					</IconButton>
					<Typography component="span" sx={{ mx: 1 }}>
						{currentWeek === 0 ? 'Текущая неделя' :
							currentWeek < 0 ? `${Math.abs(currentWeek)} неделя назад` :
								`${currentWeek} неделя вперед`}
					</Typography>
					<IconButton onClick={handleNextWeek}>
						<ChevronRight />
					</IconButton>
				</Box>
			</Box>

			<TableContainer component={Paper}>
				<Table>
					<TableBody>
						{scheduleData.map(({ day, dateString, classes, isCurrent, date }) => {
							const isToday = isCurrentDay(date);

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

									{classes.map((cls, idx) => {
										const isCurrentPair = isToday && cls.num === currentPair;

										return (
											<TableRow
												key={idx}
												sx={{
													bgcolor: isCurrentPair ? 'primary.main' : isToday ? 'rgba(76, 175, 80, 0.04)' : 'inherit',
													color: isCurrentPair ? 'primary.contrastText' : 'inherit',
													'&:last-child td': {
														borderBottom: isToday ? 'none' : 'inherit'
													}
												}}
											>
												<TableCell
													width={60}
													align="center"
													sx={{ fontWeight: isCurrentPair ? 'bold' : 'normal' }}
												>
													{cls.num}
												</TableCell>
												<TableCell>
													<Typography fontWeight={isCurrentPair ? 'bold' : 'medium'}>
														{cls.name}
													</Typography>
													<Typography
														variant="body2"
														sx={{ color: isCurrentPair ? 'primary.contrastText' : 'text.secondary' }}
													>
														{cls.teacher}
													</Typography>
												</TableCell>
												<TableCell width={120}>
													<Box sx={{
														display: 'flex',
														justifyContent: 'space-between',
														fontWeight: isCurrentPair ? 'bold' : 'normal'
													}}>
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
		</Box>
	);
};

export default Schedule;
