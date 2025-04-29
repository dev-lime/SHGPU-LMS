# validators.js

Набор валидаторов для веб-приложения LMS. Поддерживает валидацию телефона, email, Telegram-ссылок, паролей и названий учебных групп.

## Функции

### Телефон

#### validatePhone(phoneNumber: string): boolean
Проверяет, что номер телефона начинается с +7 или 8 и содержит 11 цифр.

#### getPhoneError(phoneNumber: string): string
Возвращает сообщение об ошибке, если телефон некорректен.

---

### Telegram

#### validateTelegramUrl(url: string): boolean
Проверяет, что ссылка на Telegram имеет вид @username или t.me/username.

#### getTelegramError(url: string): string
Возвращает сообщение об ошибке, если Telegram-ссылка некорректна.

---

### Email

#### validateEmail(email: string): boolean
Проверяет корректность email по базовому шаблону.

---

### Пароль

#### validatePassword(password: string): boolean
Проверяет, что длина пароля не менее 6 символов.

#### getPasswordError(password: string): string
Возвращает сообщение об ошибке, если пароль слишком короткий или отсутствует.

#### getPasswordStrength(password: string): number
Возвращает уровень надёжности пароля от 0 (очень слабый) до 4 (очень сильный).

#### getPasswordStrengthText(strength: number): { text: string, color: string }
Возвращает описание и цвет уровня надёжности пароля.

---

### Учебные группы

#### validateGroup(groupName: string): boolean
Проверяет, соответствует ли название группы допустимым форматам (очное, заочное, подгруппы и т.п.).

#### normalizeGroupName(groupName: string): string
Приводит название группы к верхнему регистру.

#### getGroupError(groupName: string): string
Возвращает сообщение об ошибке, если формат группы не распознан.

##### Примеры корректных форматов групп

- 230б
- 133б-а
- 2-11б
- 3-15б-а
- 1-55б/1
