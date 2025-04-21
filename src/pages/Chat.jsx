import React, { useState } from 'react';
import {
	Typography,
	List,
	ListItem,
	ListItemAvatar,
	Avatar,
	TextField,
	InputAdornment,
	Badge,
	Box,
	Divider
} from '@mui/material';
import { Search } from '@mui/icons-material';

const chats = [
	{
		id: 1,
		name: "Чат общежития",
		lastMessage: "Завтра проверка комнат",
		time: "21:30",
		unread: 7,
	},
	{
		id: 2,
		name: "Академическая группа",
		lastMessage: "Завтра собрание в 14:00",
		time: "12:30",
		unread: 2,
	},
	{
		id: 3,
		name: "Чат по программированию",
		lastMessage: "Кто разобрал алгоритм?",
		time: "11:10",
		unread: 3,
	},
	{
		id: 4,
		name: "Преподаватель",
		lastMessage: "Пришлите ваши работы",
		time: "10:15",
		unread: 0,
	},
	{
		id: 5,
		name: "Куратор группы",
		lastMessage: "Не забудьте про дедлайн!",
		time: "09:45",
		unread: 0,
	},
	{
		id: 6,
		name: "Староста группы",
		lastMessage: "Расписание изменилось!",
		time: "08:00",
		unread: 0,
	},
	{
		id: 7,
		name: "Одногруппник",
		lastMessage: "Привет, есть вопросы по заданию",
		time: "Вчера",
		unread: 1,
	},
	{
		id: 8,
		name: "Профком",
		lastMessage: "Регистрация на мероприятие открыта",
		time: "Вчера",
		unread: 5,
	},
	{
		id: 9,
		name: "Чат выпускников",
		lastMessage: "Какие выпускники, мы второй курс",
		time: "20 мая",
		unread: 0,
	},
];

export default function Chat() {
	const [searchQuery, setSearchQuery] = useState('');

	// Фильтрация чатов по поисковому запросу
	const filteredChats = chats.filter(chat =>
		chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<Box sx={{
			height: '100%',
			display: 'flex',
			flexDirection: 'column',
			p: 2
		}}>
			{/* Заголовок и поиск */}
			<Box sx={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				mb: 3,
				gap: 2
			}}>
				<Typography
					variant="h5"
					sx={{
						fontWeight: 600,
						color: 'text.primary',
						whiteSpace: 'nowrap'
					}}
				>
					Чаты
				</Typography>

				<TextField
					variant="outlined"
					placeholder="Поиск"
					size="small"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					sx={{
						width: '100%',
						maxWidth: 400,
						'& .MuiOutlinedInput-root': {
							borderRadius: '28px',
							backgroundColor: 'background.paper',
							'& fieldset': {
								borderColor: 'divider',
							},
							'&:hover fieldset': {
								borderColor: 'primary.main',
							},
							'&.Mui-focused fieldset': {
								borderColor: 'primary.main',
								borderWidth: '1px',
							},
						},
					}}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<Search color="primary" />
							</InputAdornment>
						),
					}}
				/>
			</Box>

			{/* Список чатов */}
			<List sx={{
				flex: 1,
				overflow: 'hidden'
			}}>
				{filteredChats.length > 0 ? (
					filteredChats.map((chat, index) => (
						<React.Fragment key={chat.id}>
							<ListItem
								sx={{
									py: 1.5,
									px: 1,
									display: 'flex',
									alignItems: 'center',
									'&:hover': {
										backgroundColor: 'action.hover',
										borderRadius: 1,
										cursor: 'pointer'
									}
								}}
							>
								<ListItemAvatar>
									<Avatar sx={{ bgcolor: 'primary.main' }}>
										{chat.name.charAt(0)}
									</Avatar>
								</ListItemAvatar>
								<Box
									sx={{
										flex: 1,
										minWidth: 0,
										display: 'flex',
										flexDirection: 'column',
										ml: 1,
									}}
								>
									<Box
										sx={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											gap: 1,
											width: '100%',
										}}
									>
										<Typography
											variant="subtitle1"
											fontWeight="medium"
											noWrap
											sx={{ flex: 1, minWidth: 0 }}
										>
											{chat.name}
										</Typography>
										<Typography
											variant="caption"
											color="text.secondary"
											sx={{ flexShrink: 0 }}
										>
											{chat.time}
										</Typography>
									</Box>

									<Box
										sx={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											gap: 1,
											width: '100%',
										}}
									>
										<Typography
											variant="body2"
											color="text.secondary"
											noWrap
											sx={{ flex: 1, minWidth: 0 }}
										>
											{chat.lastMessage}
										</Typography>
										{chat.unread > 0 && (
											<Badge
												badgeContent={chat.unread}
												color="primary"
												sx={{
													mr: 1
												}}
											/>
										)}
									</Box>
								</Box>
							</ListItem>
						</React.Fragment>
					))
				) : (
					<Box sx={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						height: '100%',
						color: 'text.secondary'
					}}>
						<Typography variant="body1">Ничего не найдено</Typography>
					</Box>
				)}
			</List>
		</Box>
	);
}
