import React from 'react';
import {
	Typography,
	List,
	ListItem,
	ListItemAvatar,
	Avatar,
	Divider,
	Badge,
	Box
} from '@mui/material';

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
		lastMessage: "Встреча через неделю!",
		time: "20 мая",
		unread: 0,
	},
];

export default function Chat() {
	return (
		<Box sx={{ height: '100%', overflow: 'auto' }}>
			<Typography variant="h6" sx={{ p: 2, pb: 1 }}>Чаты</Typography>
			<List>
				{chats.map((chat) => (
					<React.Fragment key={chat.id}>
						<ListItem
							sx={{
								py: 1.5,
								display: 'flex',
								alignItems: 'flex-start',
							}}
							>
							<ListItemAvatar>
								<Avatar>{chat.name.charAt(0)}</Avatar>
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
												'& .MuiBadge-badge': {
													transform: 'scale(1) translate(50%, -50%)',
												},
											}}
										/>
									)}
								</Box>
							</Box>
						</ListItem>
						<Divider variant="inset" component="li" />
					</React.Fragment>
				))}
			</List>
		</Box>
	);
}
