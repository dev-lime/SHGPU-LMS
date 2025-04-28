import React, { useState, useEffect } from 'react';
import {
	Typography,
	List,
	ListItem,
	ListItemAvatar,
	Avatar,
	Badge,
	Box,
	Tabs,
	Tab,
	CircularProgress,
	IconButton
} from '@mui/material';
import {
	ChatBubble,
	People,
	Send
} from '@mui/icons-material';
import { db, auth } from '@src/firebase';
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
import { useSwipeable } from 'react-swipeable';
import SearchBar from '@components/SearchBar';

export default function Messenger() {
	const [searchQuery, setSearchQuery] = useState('');
	const [activeTab, setActiveTab] = useState(0);
	const [users, setUsers] = useState([]);
	const [chats, setChats] = useState([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	// Обработчик свайпов
	const swipeHandlers = useSwipeable({
		onSwipedLeft: () => {
			if (activeTab === 0) {
				setActiveTab(1);
			}
		},
		onSwipedRight: () => {
			if (activeTab === 1) {
				setActiveTab(0);
			}
		},
		preventDefaultTouchmoveEvent: true,
		trackMouse: true,
		trackTouch: true
	});

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
				// Если чат существует - переходим к нему
				navigate(`/chat/${existingChat.id}`);
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

			// Переходим к новому чату
			navigate(`/chat/${newChatRef.id}`);
		} catch (error) {
			console.error("Error creating chat:", error);
		}
	};

	return (
		<Box
			sx={{
				height: '100dvh',
				bgcolor: 'background.default',
				display: 'flex',
				flexDirection: 'column',
				p: 2
			}}
			{...swipeHandlers}
		>
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

				<SearchBar
					placeholder={activeTab === 0 ? "Поиск чатов" : "Поиск пользователей"}
					value={searchQuery}
					onChange={setSearchQuery}
				/>
			</Box>

			{/* Контент*/}
			<Box sx={{
				flex: 1,
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column'
			}}>
				{loading ? (
					<Box sx={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						flex: 1
					}}>
						<CircularProgress />
					</Box>
				) : activeTab === 0 ? (
					<Box sx={{ flex: 1 }}>
						<ChatList
							chats={chats.filter(chat =>
								chat.participantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
								chat.lastMessage?.text.toLowerCase().includes(searchQuery.toLowerCase())
							)}
							onChatClick={(id) => navigate(`/chat/${id}`)}
						/>
					</Box>
				) : (
					<Box sx={{ flex: 1 }}>
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
								color: 'text.secondary',
								flex: 1
							}}>
								<Typography variant="body2">
									Введите минимум 2 символа для поиска
								</Typography>
							</Box>
						)}
					</Box>
				)}
			</Box>
		</Box>
	);
}

// Компонент списка чатов
const ChatList = ({ chats, onChatClick }) => {
	const navigate = useNavigate();

	const handleAvatarClick = (userId, e) => {
		e.stopPropagation();
		navigate(`/user/${userId}`);
	};

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
			{chats.map((chat) => {
				const otherParticipantId = chat.participants.find(id => id !== auth.currentUser?.uid);
				const isCurrentUserSender = chat.lastMessage?.sender === auth.currentUser?.uid;

				return (
					<React.Fragment key={chat.id}>
						<ListItem
							component="button"
							onClick={() => onChatClick(chat.id)}
							sx={{
								px: 1,
								borderRadius: 1,
								'&:hover': { backgroundColor: 'action.hover' },
								'&.Mui-selected, &:focus': { outline: 'none' },
								backgroundColor: 'transparent'
							}}
						>
							<ListItemAvatar>
								<Avatar
									src={chat.participantPhoto}
									sx={{
										bgcolor: 'primary.main',
										cursor: 'pointer',
										'&:hover': {
											transform: 'scale(1.1)',
											transition: 'transform 0.2s'
										}
									}}
									onClick={(e) => handleAvatarClick(otherParticipantId, e)}
								>
									{chat.participantName?.charAt(0)}
								</Avatar>
							</ListItemAvatar>
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
									<Typography
										noWrap
										fontWeight="medium"
										sx={{
											color: 'text.primary'
										}}
									>
										{chat.participantName}
									</Typography>
									{chat.lastMessage?.timestamp && (
										<Typography variant="caption" color="text.secondary">
											{formatDate(chat.lastMessage.timestamp)}
										</Typography>
									)}
								</Box>
								<Typography
									noWrap
									variant="body2"
									color='text.secondary'
									sx={{
										fontStyle: isCurrentUserSender ? 'italic' : 'normal'
									}}
								>
									{isCurrentUserSender ? 'Вы: ' : ''}
									{chat.lastMessage?.text}
								</Typography>
							</Box>
							{chat.unreadCount > 0 && (
								<Badge badgeContent={chat.unreadCount} color="primary" />
							)}
						</ListItem>
					</React.Fragment>
				);
			})}
		</List>
	);
};

const UserList = ({ users, onUserClick, currentUserId }) => {
	const navigate = useNavigate();

	const handleUserClick = (userId) => {
		navigate(`/user/${userId}`);
	};

	const handleChatButtonClick = (userId, e) => {
		e.stopPropagation(); // Останавливаем всплытие события
		onUserClick(userId); // Создаем/открываем чат
	};

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
						component="div"
						onClick={() => handleUserClick(user.id)}
						sx={{
							px: 1,
							borderRadius: 1,
							'&:hover': { backgroundColor: 'action.hover' },
							'&.Mui-selected, &:focus': { outline: 'none' },
							backgroundColor: 'transparent',
							width: '100%',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							cursor: 'pointer'
						}}
					>
						<Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
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
						</Box>
						<IconButton
							onClick={(e) => handleChatButtonClick(user.id, e)}
							size="medium"
							sx={{
								ml: 1,
								'&:hover': {
									backgroundColor: 'rgba(0, 0, 0, 0.04)',
									color: 'primary.main'
								}
							}}
						>
							<Send fontSize="medium" color="primary" />
						</IconButton>
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
