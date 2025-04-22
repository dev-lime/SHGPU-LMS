import React, { useState, useEffect } from 'react';
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
	Divider,
	Tabs,
	Tab,
	CircularProgress
} from '@mui/material';
import { Search, ChatBubble, People } from '@mui/icons-material';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, orderBy, limit } from 'firebase/firestore';

export default function Messenger() {
	const [searchQuery, setSearchQuery] = useState('');
	const [activeTab, setActiveTab] = useState(0);
	const [users, setUsers] = useState([]);
	const [chats, setChats] = useState([]);
	const [loading, setLoading] = useState(true);

	// Поиск пользователей
	useEffect(() => {
		const searchUsers = async () => {
			if (searchQuery.length < 2) {
				setUsers([]);
				return;
			}

			setLoading(true);
			try {
				const q = query(
					collection(db, 'users'),
					where('displayName', '>=', searchQuery),
					where('displayName', '<=', searchQuery + '\uf8ff'),
					limit(10)
				);

				const snapshot = await getDocs(q);
				const usersData = snapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data()
				})).filter(user => user.id !== auth.currentUser?.uid);

				setUsers(usersData);
			} catch (error) {
				console.error("Error searching users:", error);
			} finally {
				setLoading(false);
			}
		};

		const timer = setTimeout(searchUsers, 500);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Загрузка чатов текущего пользователя
	useEffect(() => {
		const loadChats = async () => {
			try {
				const q = query(
					collection(db, 'chats'),
					where('participants', 'array-contains', auth.currentUser?.uid),
					orderBy('lastMessage.timestamp', 'desc')
				);

				const snapshot = await getDocs(q);
				const chatsData = snapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data()
				}));

				setChats(chatsData);
			} catch (error) {
				console.error("Error loading chats:", error);
			} finally {
				setLoading(false);
			}
		};

		loadChats();
	}, []);

	// Создание нового чата
	const createChat = async (userId) => {
		try {
			// Проверяем, существует ли уже чат
			const q = query(
				collection(db, 'chats'),
				where('participants', 'array-contains', userId)
			);

			const snapshot = await getDocs(q);
			const existingChat = snapshot.docs.find(doc =>
				doc.data().participants.includes(auth.currentUser?.uid)
			);

			if (existingChat) {
				// Переходим к существующему чату
				console.log("Chat already exists:", existingChat.id);
				return;
			}

			// Создаем новый чат
			const newChatRef = doc(collection(db, 'chats'));
			await setDoc(newChatRef, {
				participants: [auth.currentUser?.uid, userId],
				createdAt: new Date(),
				lastMessage: {
					text: 'Чат создан',
					sender: auth.currentUser?.uid,
					timestamp: new Date()
				}
			});

			console.log("New chat created:", newChatRef.id);
		} catch (error) {
			console.error("Error creating chat:", error);
		}
	};

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
				flexDirection: 'column',
				mb: 3,
				gap: 2
			}}>
				<Tabs
					value={activeTab}
					onChange={(e, newValue) => setActiveTab(newValue)}
				>
					<Tab
						sx={{
							display: 'flex',
							alignItems: 'center',
							'&.Mui-selected': {
								outline: 'none'
							},
							'&:focus': {
								outline: 'none'
							}
						}}
						label={
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<ChatBubble sx={{ marginRight: 1 }} />
								Чаты
							</Box>
						}
					/>
					<Tab
						sx={{
							display: 'flex',
							alignItems: 'center',
							'&.Mui-selected': {
								outline: 'none'
							},
							'&:focus': {
								outline: 'none'
							}
						}}
						label={
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<People sx={{ marginRight: 1 }} />
								Поиск
							</Box>
						}
					/>
				</Tabs>

				<TextField
					variant="outlined"
					placeholder={activeTab === 0 ? "Поиск чатов" : "Поиск пользователей"}
					size="small"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					sx={{
						width: '100%',
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

			{/* Контент в зависимости от выбранной вкладки */}
			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
					<CircularProgress />
				</Box>
			) : activeTab === 0 ? (
				// Список чатов
				<ChatList
					chats={chats.filter(chat =>
						chat.participantNames?.toLowerCase().includes(searchQuery.toLowerCase()) ||
						chat.lastMessage?.text.toLowerCase().includes(searchQuery.toLowerCase())
					)}
				/>
			) : (
				// Список пользователей
				<UserList
					users={users}
					onUserClick={createChat}
					currentUserId={auth.currentUser?.uid}
				/>
			)}
		</Box>
	);
}

// Компонент списка чатов
const ChatList = ({ chats }) => {
	if (chats.length === 0) {
		return (
			<Box sx={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100%',
				color: 'text.secondary'
			}}>
				<Typography variant="body1">Чатов не найдено</Typography>
			</Box>
		);
	}

	return (
		<List sx={{ flex: 1, overflow: 'auto' }}>
			{chats.map((chat) => (
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
								{chat.participantNames?.charAt(0)}
							</Avatar>
						</ListItemAvatar>
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
								<Typography noWrap fontWeight="medium">
									{chat.participantNames}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									{formatDate(chat.lastMessage?.timestamp)}
								</Typography>
							</Box>
							<Typography noWrap variant="body2" color="text.secondary">
								{chat.lastMessage?.text}
							</Typography>
						</Box>
						{chat.unreadCount > 0 && (
							<Badge badgeContent={chat.unreadCount} color="primary" />
						)}
					</ListItem>
					<Divider variant="inset" />
				</React.Fragment>
			))}
		</List>
	);
};

// Компонент списка пользователей
const UserList = ({ users, onUserClick, currentUserId }) => {
	if (users.length === 0) {
		return (
			<Box sx={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100%',
				color: 'text.secondary'
			}}>
				<Typography variant="body1">Пользователи не найдены</Typography>
			</Box>
		);
	}

	return (
		<List sx={{ flex: 1, overflow: 'auto' }}>
			{users.map((user) => (
				<React.Fragment key={user.id}>
					<ListItem
						button
						onClick={() => onUserClick(user.id)}
						sx={{
							py: 1.5,
							px: 1,
							'&:hover': {
								backgroundColor: 'action.hover',
								borderRadius: 1
							}
						}}
					>
						<ListItemAvatar>
							<Avatar src={user.photoURL} sx={{ bgcolor: 'primary.main' }}>
								{user.displayName?.charAt(0)}
							</Avatar>
						</ListItemAvatar>
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Typography noWrap fontWeight="medium">
								{user.displayName}
							</Typography>
							<Typography noWrap variant="body2" color="text.secondary">
								{user.email}
							</Typography>
						</Box>
					</ListItem>
					<Divider variant="inset" />
				</React.Fragment>
			))}
		</List>
	);
};

// Вспомогательная функция для форматирования даты
const formatDate = (timestamp) => {
	if (!timestamp) return '';
	const date = timestamp.toDate();
	const now = new Date();

	if (date.toDateString() === now.toDateString()) {
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};
