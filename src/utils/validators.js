/**
 * Валидация URL изображения
 * @param {string} url - URL для проверки
 * @returns {boolean} - Валидный ли URL
 */
export const validateImageUrl = (url) => {
    if (!url) return false;
    try {
        new URL(url);
        return /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
    } catch {
        return false;
    }
};

/**
 * Получение ошибки для URL изображения
 * @param {string} url - URL для проверки
 * @returns {string} - Текст ошибки или пустая строка, если ошибок нет
 */
export const getImageUrlError = (url) => {
    if (!url) return 'Введите URL изображения';
    if (!validateImageUrl(url)) {
        return 'Введите корректную ссылку на изображение (JPEG, JPG, PNG, GIF, WEBP)';
    }
    return '';
};

/**
 * Валидация имени пользователя
 * @param {string} name - Имя для проверки
 * @returns {boolean} - Валидное ли имя
 */
export const validateUserName = (name) => {
    if (!name) return false;
    return /^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(name);
};

/**
 * Получение ошибки для имени пользователя
 * @param {string} name - Имя для проверки
 * @returns {string} - Текст ошибки или пустая строка, если ошибок нет
 */
export const getUserNameError = (name) => {
    if (!name) return 'Введите имя пользователя';
    if (!validateUserName(name)) {
        return 'Имя может содержать только буквы (кириллица/латиница), пробелы и дефисы';
    }
    if (name.length < 2) return 'Имя должно содержать минимум 2 символа';
    if (name.length > 50) return 'Имя должно содержать максимум 50 символов';
    return '';
};

/**
 * Валидация номера телефона
 * @param {string} phoneNumber - Номер телефона для проверки
 * @returns {boolean} - Валидный ли номер телефона
 */
export const validatePhone = (phoneNumber) => {
    const regex = /^(\+7|8)[0-9]{10}$/;
    return regex.test(phoneNumber);
};

/**
 * Получение ошибки для номера телефона
 * @param {string} phoneNumber - Номер телефона для проверки
 * @returns {string} - Текст ошибки или пустая строка, если ошибок нет
 */
export const getPhoneError = (phoneNumber) => {
    if (!phoneNumber) return '';
    return validatePhone(phoneNumber) ? '' : 'Телефон должен начинаться с +7 или 8 и содержать 11 цифр';
};

/**
 * Валидация адреса электронной почты
 * @param {string} email - Email для проверки
 * @returns {boolean} - Валидный ли адрес электронной почты
 */
export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

/**
 * Валидация пароля
 * @param {string} password - Пароль для проверки
 * @returns {boolean} - Валидный ли пароль (длина >= 6)
 */
export const validatePassword = (password) => {
    return password.length >= 6;
};

/**
 * Получение ошибки для пароля
 * @param {string} password - Пароль для проверки
 * @returns {string} - Текст ошибки или пустая строка, если ошибок нет
 */
export const getPasswordError = (password) => {
    if (!password) return 'Введите пароль';
    if (password.length < 6) return 'Пароль должен содержать минимум 6 символов';
    return '';
};

/**
 * Определение уровня сложности пароля
 * @param {string} password - Пароль для проверки
 * @returns {number} - Уровень сложности пароля (от 0 до 4)
 */
export const getPasswordStrength = (password) => {
    if (!password || password.length < 6) return 0;

    let strength = 0;
    strength += Math.min(Math.floor(password.length / 3), 3);
    if (/\d/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 2;

    return Math.min(Math.floor(strength / 2), 4);
};

/**
 * Получение текста уровня сложности пароля
 * @param {number} strength - Уровень сложности пароля (от 0 до 4)
 * @returns {{text: string, color: string}} - Объект с текстовым представлением уровня сложности и цветом
 */
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

/**
 * Валидация названия группы
 * @param {string} groupName - Название группы для проверки
 * @returns {boolean} - Валидное ли название группы
 */
export const validateGroup = (groupName) => {
    if (!groupName) return false;
    const normalizedGroup = groupName.toUpperCase();

    const patterns = [
        /^\d{3}[БМС]$/,
        /^\d{3}[БМС]-[А-Г]$/,
        /^\d-\d{2}[БМС]$/,
        /^\d-\d{2}[БМС]-[А-Г]$/,
        /^\d-\d{2}[БМС]\/\d$/,
        /^\d-\d{2}[БМС]-[А-Г]\/\d$/
    ];

    return patterns.some(pattern => pattern.test(normalizedGroup));
};

/**
 * Нормализация названия группы
 * @param {string} groupName - Название группы для нормализации
 * @returns {string} - Нормализованное название группы в верхнем регистре
 */
export const normalizeGroupName = (groupName) => {
    if (!groupName) return '';
    return groupName.toUpperCase();
};

/**
 * Получение ошибки для названия группы
 * @param {string} groupName - Название группы для проверки
 * @returns {string} - Текст ошибки или пустая строка, если ошибок нет
 */
export const getGroupError = (groupName) => {
    if (!groupName) return 'Введите номер группы';
    if (!validateGroup(groupName)) {
        return 'Формат группы не распознан. Примеры: 230б, 133б-а, 2-11б, 3-15б-а, 1-55б/1';
    }
    return '';
};

/**
 * Валидация URL Telegram
 * @param {string} url - URL для проверки
 * @returns {boolean} - Валидный ли URL
 */
export const validateTelegramUrl = (url) => {
    if (!url) return true;
    const telegramRegex = /^(https?:\/\/)?(t\.me\/|@)[a-zA-Z0-9_]{5,32}$/;
    return telegramRegex.test(url);
};

/**
 * Получение ошибки для URL Telegram
 * @param {string} url - URL для проверки
 * @returns {string} - Текст ошибки или пустая строка, если ошибок нет
 */
export const getTelegramError = (url) => {
    if (!url) return '';
    return validateTelegramUrl(url) ? '' : 'Введите корректную ссылку Telegram (например: @username или t.me/username)';
};
