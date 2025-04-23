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
import {
	collection,
	query,
	where,
	getDocs,
	doc,
	setDoc,
	orderBy,
	limit,
	getDoc,
	serverTimestamp
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Messenger() {
	const [searchQuery, setSearchQuery] = useState('');
	const [activeTab, setActiveTab] = useState(0);
	const [users, setUsers] = useState([]);
	const [chats, setChats] = useState([]);
	const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

	// Поиск пользователей
	useEffect(() => {
		const searchUsers = async () => {
			setLoading(true);
			try {
				let usersQuery;

				if (searchQuery.length === 0) {
					// Получаем 10 случайных пользователей
					usersQuery = query(
						collection(db, 'users'),
						where('fullName', '!=', ''),
						limit(10)
					);
				} else if (searchQuery.length === 1) {
					setUsers([]);
					setLoading(false);
					return;
				} else {
					// Поиск по имени
					usersQuery = query(
						collection(db, 'users'),
						where('fullName', '>=', searchQuery),
						where('fullName', '<=', searchQuery + '\uf8ff'),
						limit(10)
					);
				}

				const snapshot = await getDocs(usersQuery);
				const usersData = snapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data()
				})).filter(user => user.id !== auth.currentUser?.uid);

				// Убираем учет регистра при фильтрации
				const filteredUsers = usersData.filter(user =>
					user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
				);
				setUsers(filteredUsers);
			} catch (error) {
				console.error("Error searching users:", error);
			} finally {
				setLoading(false);
			}
		};

		const timer = setTimeout(searchUsers, 500);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Загрузка чатов
	useEffect(() => {
		const loadChats = async () => {
			try {
				const q = query(
					collection(db, 'chats'),
					where('participants', 'array-contains', auth.currentUser?.uid),
					orderBy('lastMessage.timestamp', 'desc')
				);

				const snapshot = await getDocs(q);
				const chatsData = await Promise.all(
					snapshot.docs.map(async (document) => {
						const chatData = document.data();
						const otherParticipantId = chatData.participants.find(
							id => id !== auth.currentUser?.uid
						);

						let participantName = chatData.participantNames || 'Unknown';
						let participantPhoto = '';

						if (otherParticipantId) {
							const userDocRef = doc(db, 'users', otherParticipantId);
							const userDoc = await getDoc(userDocRef);
							if (userDoc.exists()) {
								const userData = userDoc.data();
								participantName = userData.fullName || userData.email;
								participantPhoto = userData.avatarUrl || '';
							}
						}

						return {
							id: document.id,
							...chatData,
							participantName,
							participantPhoto
						};
					})
				);

				setChats(chatsData);
			} catch (error) {
				console.error("Error loading chats:", error);
			} finally {
				setLoading(false);
			}
		};

		loadChats();
	}, []);

	// Создание чата
	const createChat = async (userId) => {
		try {
			// Проверка существующего чата
			const chatsRef = collection(db, 'chats');
			const q = query(
				chatsRef,
				where('participants', 'array-contains', userId)
			);

			const querySnapshot = await getDocs(q);
			const existingChat = querySnapshot.docs.find(doc =>
				doc.data().participants.includes(auth.currentUser?.uid)
			);

			if (existingChat) {
				console.log("Chat exists:", existingChat.id);
				return;
			}

			// Получаем данные пользователя
			const userDocRef = doc(db, 'users', userId);
			const userDoc = await getDoc(userDocRef);
			const userData = userDoc.exists() ? userDoc.data() : {};
			const userName = userData.fullName || userData.email || 'Unknown';

			// Создаем новый чат
			const newChatRef = doc(chatsRef);
			await setDoc(newChatRef, {
				participants: [auth.currentUser?.uid, userId],
				participantNames: userName,
				createdAt: serverTimestamp(),
				lastMessage: {
					text: 'Чат создан',
					sender: auth.currentUser?.uid,
					timestamp: serverTimestamp()
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
							'&:hover': { backgroundColor: 'action.hover' },
							'&.Mui-selected': { outline: 'none' },
							'&:focus': { outline: 'none' }
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
							'&:hover': { backgroundColor: 'action.hover' },
							'&.Mui-selected': { outline: 'none' },
							'&:focus': { outline: 'none' }
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
							'& fieldset': { borderColor: 'divider' },
							'&:hover fieldset': { borderColor: 'primary.main' },
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
				<ChatList
					chats={chats.filter(chat =>
						chat.participantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
						chat.lastMessage?.text.toLowerCase().includes(searchQuery.toLowerCase())
					)}
					onChatClick={(id) => navigate(`/chat/${id}`)}
				/>
			) : (
				<>
					<UserList
						users={users}
						onUserClick={createChat}
						currentUserId={auth.currentUser?.uid}
					/>
					{searchQuery.length === 1 && (
						<Box sx={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							p: 2,
							color: 'text.secondary'
						}}>
							<Typography variant="body2">
								Введите минимум 2 символа для поиска
							</Typography>
						</Box>
					)}
				</>
			)}
		</Box>
	);
}

// Компонент списка чатов
const ChatList = ({ chats, onChatClick }) => {
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
						component="button"
						onClick={() => onChatClick(chat.id)}
						sx={{
							px: 1,
							borderRadius: 1,
							'&:hover': { backgroundColor: 'action.hover' },
							'&.Mui-selected': { outline: 'none' },
							'&:focus': { outline: 'none' },
							backgroundColor: 'transparent'
						}}
					>
						<ListItemAvatar>
							<Avatar src={chat.participantPhoto} sx={{ bgcolor: 'primary.main' }}>
								{chat.participantName?.charAt(0)}
							</Avatar>
						</ListItemAvatar>
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
								<Typography noWrap fontWeight="medium">
									{chat.participantName}
								</Typography>
								{chat.lastMessage?.timestamp && (
									<Typography variant="caption" color="text.secondary">
										{formatDate(chat.lastMessage.timestamp)}
									</Typography>
								)}
							</Box>
							<Typography noWrap variant="body2" color="text.secondary">
								{chat.lastMessage?.text}
							</Typography>
						</Box>
						{chat.unreadCount > 0 && (
							<Badge badgeContent={chat.unreadCount} color="primary" />
						)}
					</ListItem>
				</React.Fragment>
			))}
		</List>
	);
};

// Компонент UserList
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
						component="button"
						onClick={() => onUserClick(user.id)}
						sx={{
							px: 1,
							borderRadius: 1,
							'&:hover': { backgroundColor: 'action.hover' },
							'&.Mui-selected': { outline: 'none' },
							'&:focus': { outline: 'none' },
							backgroundColor: 'transparent'
						}}
					>
						<ListItemAvatar>
							<Avatar src={user.avatarUrl} sx={{ bgcolor: 'primary.main' }}>
								{user.fullName?.charAt(0)}
							</Avatar>
						</ListItemAvatar>
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Typography noWrap fontWeight="medium">
								{user.fullName}
							</Typography>
							<Typography noWrap variant="body2" color="text.secondary">
								{user.email}
							</Typography>
						</Box>
					</ListItem>
				</React.Fragment>
			))}
		</List>
	);
};

const formatDate = (timestamp) => {
	if (!timestamp) return '';

	// Обрабатывает разные форматы timestamp:
	// 1. Firebase Timestamp (имеет метод toDate)
	// 2. Нативный объект Date
	// 3. Строка, которую можно преобразовать в Date
	let date;

	if (typeof timestamp === 'object' && timestamp.toDate) {
		// Firebase Timestamp
		date = timestamp.toDate();
	} else if (timestamp instanceof Date) {
		// Уже объект Date
		date = timestamp;
	} else {
		// Пытаемся преобразовать строку или число в Date
		date = new Date(timestamp);
		if (isNaN(date.getTime())) return ''; // Некорректная дата
	}

	const now = new Date();

	if (date.toDateString() === now.toDateString()) {
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};
