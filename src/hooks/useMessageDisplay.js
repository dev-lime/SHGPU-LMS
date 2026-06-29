import { useCallback } from 'react';
import { auth } from '@src/firebase';

const controlChars = new RegExp(
	'[' + String.fromCharCode(0) + '-' + String.fromCharCode(8) +
	String.fromCharCode(11) + '-' + String.fromCharCode(31) +
	String.fromCharCode(127) + ']', 'g'
);

export const cleanMessageText = (text) => {
	text = text.replace(controlChars, '');
	text = text.replace(/[\u202A-\u202E\u2066-\u2069\u200B-\u200F\uFEFF]/g, '');
	text = text.replace(/([\u0300-\u036F]){5,}/g, '');
	if (text.length > 4096) {
		text = text.substring(0, 4096);
	}
	return text;
};

export const formatMessageDate = (date) => {
	if (!date) return '';
	try {
		return date.toLocaleDateString('ru-RU', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	} catch {
		return '';
	}
};

export const getTimeString = (timestamp) => {
	try {
		if (!timestamp?.toDate) return '';
		const date = timestamp.toDate();
		return date?.toLocaleTimeString?.([], { hour: '2-digit', minute: '2-digit' }) || '';
	} catch {
		return '';
	}
};

export const getUserRoleText = (user) => {
	if (!user?.accountType) return '';
	if (user.accountType === 'student') {
		return user.studentGroup ? `Студент, ${user.studentGroup}` : 'Студент';
	}
	if (user.accountType === 'teacher' || user.accountType === 'employee') {
		return user.position ? `${roleLabel(user.accountType)}, ${user.position}` : roleLabel(user.accountType);
	}
	return roleLabel(user.accountType) || '';
};

const roleLabel = (type) => ({
	teacher: 'Преподаватель',
	employee: 'Сотрудник',
	admin: 'Администратор'
})[type] || type;

const useMessageDisplay = (messages) => {
	const currentUserId = auth.currentUser?.uid;

	const shouldShowAvatar = useCallback((index) => {
		if (!messages[index] || messages[index].sender === currentUserId) return false;
		if (index === messages.length - 1) return true;
		return messages[index].sender !== messages[index + 1]?.sender;
	}, [messages, currentUserId]);

	const shouldShowTime = useCallback((index) => {
		if (index === messages.length - 1) return true;
		if (!messages[index]?.timestamp || !messages[index + 1]?.timestamp) return true;

		try {
			const currentTime = messages[index].timestamp.toDate();
			const nextTime = messages[index + 1].timestamp.toDate();
			return (messages[index].sender !== messages[index + 1].sender) ||
				(nextTime.getTime() - currentTime.getTime()) > 60000;
		} catch {
			return true;
		}
	}, [messages]);

	const isNewDay = useCallback((index) => {
		if (index === 0) return true;
		if (!messages[index]?.timestamp || !messages[index - 1]?.timestamp) return false;

		try {
			const currentDate = messages[index].timestamp.toDate();
			const prevDate = messages[index - 1].timestamp.toDate();
			return currentDate.toDateString() !== prevDate.toDateString();
		} catch {
			return false;
		}
	}, [messages]);

	return { shouldShowAvatar, shouldShowTime, isNewDay };
};

export default useMessageDisplay;
