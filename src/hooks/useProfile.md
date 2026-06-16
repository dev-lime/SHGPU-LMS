# Документация по хуку `useProfile`

## Назначение
Хук `useProfile` предоставляет интерфейс для работы с профилями пользователей, включая:
- Загрузку данных профиля (собственного и других пользователей)
- Обновление информации профиля
- Управление состоянием аутентификации
- Валидацию и нормализацию данных

## Импорт
```js
import useProfile from '@hooks/useProfile';
```

## Параметры
Хук принимает необязательный параметр:

| Параметр | Тип    | По умолчанию | Описание                          |
|----------|--------|--------------|-----------------------------------|
| `userId` | String | null         | ID пользователя для загрузки профиля. Если не указан, загружается профиль текущего пользователя |

## Возвращаемые значения
Хук возвращает объект со следующими свойствами:

| Свойство               | Тип       | Описание                                                                 |
|------------------------|-----------|--------------------------------------------------------------------------|
| `userData`             | Object    | Данные профиля пользователя (null если не найдены)                       |
| `loading`              | Boolean   | Флаг загрузки данных                                                     |
| `error`                | String    | Текст ошибки (null если нет ошибок)                                      |
| `updateUserData`       | Function  | Функция для обновления данных профиля (только для текущего пользователя) |
| `handleLogout`         | Function  | Функция для выхода из системы                                            |
| `getAccountTypeIcon`   | Function  | Возвращает иконку для типа аккаунта                                      |
| `getAccountTypeLabel`  | Function  | Возвращает текстовое описание типа аккаунта                              |
| `ACCOUNT_TYPES`        | Object    | Константы с доступными типами аккаунтов                                  |
| `isOwnProfile`         | Boolean   | Флаг, указывающий принадлежит ли профиль текущему пользователю          |

## Использование

### Базовый пример (собственный профиль)
```jsx
function MyProfile() {
  const {
    userData,
    loading,
    error,
    isOwnProfile
  } = useProfile();

  if (loading) return <Loader />;
  if (error) return <Error message={error} />;

  return (
    <div>
      <h2>{userData.fullName}</h2>
      <p>Тип аккаунта: {userData.accountType} {isOwnProfile ? '(Вы)' : ''}</p>
    </div>
  );
}
```

### Пример с чужим профилем
```jsx
function UserProfilePage() {
  const { userId } = useParams();
  const {
    userData,
    loading,
    error,
    isOwnProfile
  } = useProfile(userId);

  // ... рендеринг профиля
}
```

### Обновление профиля
```jsx
const { updateUserData, isOwnProfile } = useProfile();

const handleSave = async (data) => {
  if (!isOwnProfile) return;
  
  try {
    await updateUserData(data);
    // Данные автоматически обновятся в userData
  } catch (err) {
    console.error('Update failed:', err);
  }
};
```

### Выход из системы
```jsx
const { handleLogout } = useProfile();

<button onClick={handleLogout} disabled={!isOwnProfile}>
  Выйти
</button>
```

## Константы типов аккаунтов (`ACCOUNT_TYPES`)

Доступные типы аккаунтов:
- `student` - Студент
- `teacher` - Преподаватель
- `admin` - Администратор
- `support` - Техподдержка

Структура каждого типа:
```js
{
  value: String,    // идентификатор
  label: String,    // текстовое описание
  icon: Component,  // иконка (React-компонент)
}
```

## Методы

### `updateUserData(data)`
Обновляет данные профиля текущего пользователя.

**Параметры:**
- `data` - Объект с обновляемыми полями:
  ```js
  {
    fullName: String,
    phone: String,
    studentGroup: String,  // только для студентов
    accountType: String,   // из ACCOUNT_TYPES
    telegramUrl: String,
    avatarUrl: String
  }
  ```

**Особенности:**
- Автоматически добавляет метку времени `updatedAt`
- Синхронизирует данные с Firebase Auth (displayName и photoURL)
- Доступен только для собственного профиля (`isOwnProfile === true`)

### `handleLogout()`
Выполняет выход из системы и очищает данные профиля.

### Вспомогательные методы
- `getAccountTypeIcon(type)` - возвращает иконку для типа аккаунта
- `getAccountTypeLabel(type)` - возвращает локализованное название типа

## Обработка состояний

### Сценарии загрузки
```jsx
const { userData, loading, error } = useProfile(userId);

if (loading) return <CircularProgress />;
if (error) return <Alert severity="error">{error}</Alert>;
if (!userData) return <div>Профиль не найден</div>;

// Рендерим данные профиля
```

### Обработка ошибок
Все методы хука выбрасывают исключения:
```js
try {
  await updateUserData({ fullName: 'Новое имя' });
} catch (err) {
  // err.message содержит описание ошибки
}
```

## Особенности реализации
1. **Автоматическая подписка** на изменения аутентификации
2. **Кеширование данных** - повторные запросы для того же userId выполняются быстрее
3. **Синхронизация** между Firestore и Firebase Auth
4. **Оптимизированные рендеры** - минимизация повторных вычислений
5. **Валидация данных** перед сохранением
