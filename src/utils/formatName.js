export function formatName(user) {
	if (!user) return '';
	return [user.lastName, user.firstName, user.patronymic].filter(Boolean).join(' ');
}

export function getInitials(user) {
	if (!user) return '?';
	const first = user.firstName?.[0] || '';
	const last = user.lastName?.[0] || '';
	return (last + first) || '?';
}
