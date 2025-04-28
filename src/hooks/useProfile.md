# Документация по хуку `useProfile`

## Назначение
Хук `useProfile` предоставляет удобный интерфейс для работы с профилем пользователя, включая загрузку данных, обновление информации и управление состоянием аутентификации.

## Импорт
```js
import useProfile from '@hooks/useProfile';
```

## Возвращаемые значения
Хук возвращает объект со следующими свойствами:

| Свойство               | Тип       | Описание                                                                |
|------------------------|-----------|-------------------------------------------------------------------------|
| `userData`             | Object    | Данные профиля пользователя (null если не авторизован)                  |
| `loading`              | Boolean   | Флаг загрузки данных                                                    |
| `error`                | String    | Текст ошибки (null если нет ошибок)                                     |
| `updateUserData`       | Function  | Функция для обновления данных профиля                                   |
| `handleLogout`         | Function  | Функция для выхода из системы                                           |
| `getAccountTypeIcon`   | Function  | Возвращает иконку для типа аккаунта                                     |
| `getAccountTypeLabel`  | Function  | Возвращает текстовое описание типа аккаунта                             |
| `ACCOUNT_TYPES`        | Object    | Константы с доступными типами аккаунтов                                 |

## Использование

### Базовый пример
```jsx
import useProfile from '@hooks/useProfile';

function UserProfile() {
  const {
    userData,
    loading,
    error,
    updateUserData,
    getAccountTypeIcon,
    getAccountTypeLabel
  } = useProfile();

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!userData) return <div>Пользователь не авторизован</div>;

  return (
    <div>
      <h2>{userData.fullName}</h2>
      <p>Email: {userData.email}</p>
      <p>
        {getAccountTypeIcon(userData.accountType)}
        {getAccountTypeLabel(userData.accountType)}
      </p>
    </div>
  );
}
```

### Обновление профиля
```jsx
const { updateUserData } = useProfile();

const handleUpdate = async () => {
  try {
    await updateUserData({
      fullName: 'Новое имя',
      avatarUrl: 'https://example.com/avatar.jpg'
    });
    alert('Профиль успешно обновлен!');
  } catch (err) {
    console.error('Ошибка обновления:', err);
  }
};
```

### Выход из системы
```jsx
const { handleLogout } = useProfile();

<button onClick={handleLogout}>Выйти</button>
```

## Константы типов аккаунтов (`ACCOUNT_TYPES`)

Доступные типы аккаунтов:
- `student` - Студент
- `teacher` - Преподаватель
- `admin` - Администратор
- `support` - Техподдержка

Каждый тип содержит:
- `value` - идентификатор
- `label` - текстовое описание
- `icon` - иконка (React-компонент)

## Обработка ошибок
Все функции хука выбрасывают исключения при ошибках, которые можно обработать в компоненте:
```js
try {
  await updateUserData({ fullName: 'Новое имя' });
} catch (err) {
  // Обработка ошибки
}
```

## Особенности
- Хук автоматически подписывается на изменения состояния аутентификации
- При обновлении профиля синхронизируются данные в Firestore и Firebase Auth
- Поддерживается кеширование данных между сеансами
