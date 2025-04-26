export const validatePhone = (phoneNumber) => {
    const regex = /^(\+7|8)[0-9]{10}$/;
    return regex.test(phoneNumber);
};

export const getPhoneError = (phoneNumber) => {
    if (!phoneNumber) return '';
    return validatePhone(phoneNumber) ? '' : 'Телефон должен начинаться с +7 или 8 и содержать 11 цифр';
};

export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

export const validatePassword = (password) => {
    return password.length >= 6;
};

export const getPasswordError = (password) => {
    if (!password) return 'Введите пароль';
    if (password.length < 6) return 'Пароль должен содержать минимум 6 символов';
    return '';
};

export const getPasswordStrength = (password) => {
    if (!password || password.length < 6) return 0;

    let strength = 0;

    // Базовый уровень за длину
    strength += Math.min(Math.floor(password.length / 3), 3); // Макс 3 балла за длину

    // Дополнительные баллы за сложность
    if (/\d/.test(password)) strength += 1;          // +1 за цифры
    if (/[A-Z]/.test(password)) strength += 1;      // +1 за заглавные
    if (/[a-z]/.test(password)) strength += 1;      // +1 за строчные
    if (/[^A-Za-z0-9]/.test(password)) strength += 2; // +2 за спецсимволы

    // Нормализуем до шкалы 0-4
    return Math.min(Math.floor(strength / 2), 4);
};

export const getPasswordStrengthText = (strength) => {
    const levels = [
        { text: 'Очень слабый', color: '#ff3d00' },
        { text: 'Слабый', color: '#ff9100' },
        { text: 'Средний', color: '#ffc400' },
        { text: 'Сильный', color: '#64dd17' },
        { text: 'Очень сильный', color: '#00c853' }
    ];
    return levels[strength];
};

export const validateGroup = (groupName) => {
    if (!groupName) return false;

    // Приводим к верхнему регистру для проверки, но сохраняем оригинальный ввод
    const normalizedGroup = groupName.toUpperCase();

    const patterns = [
        /^\d{3}[БМС]$/,           // Очное: 230б, 130м, 150с
        /^\d{3}[БМС]-[А-Г]$/,     // Подгруппы: 133б-а, 232б-б
        /^\d-\d{2}[БМС]$/,        // Заочное: 2-11б, 3-25м
        /^\d-\d{2}[БМС]-[А-Г]$/,  // Заочные подгруппы: 3-15б-а
        /^\d-\d{2}[БМС]\/\d$/,    // Заочные с разделением: 1-55б/1
        /^\d-\d{2}[БМС]-[А-Г]\/\d$/ // Комбинированные: 1-14б-а/1
    ];

    return patterns.some(pattern => pattern.test(normalizedGroup));
};

export const normalizeGroupName = (groupName) => {
    if (!groupName) return '';
    return groupName.toUpperCase();
};

export const getGroupError = (groupName) => {
    if (!groupName) return 'Введите номер группы';
    if (!validateGroup(groupName)) {
        return 'Формат группы не распознан. Примеры: 230б, 133б-а, 2-11б, 3-15б-а, 1-55б/1';
    }
    return '';
};
