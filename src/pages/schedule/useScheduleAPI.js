import { useState } from 'react';

const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const API_URL = 'http://shspu.ru/sch_api/index.php';

/**
 * Хук для работы с API расписания ШГПУ
 * @returns {Object} Объект с методами API и состоянием запроса
 */
export function useScheduleAPI() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Базовый метод для вызова API
     * @param {string} method - Метод API
     * @param {Object} params - Параметры запроса
     * @returns {Promise} Промис с результатом запроса
     */
    const callAPI = async (method, params = {}) => {
        setLoading(true);
        setError(null);

        try {
            let url = `${API_URL}?method=${method}`;

            // Обработка параметров для bulk методов
            if (method.includes('bulk')) {
                for (const [key, value] of Object.entries(params)) {
                    if (Array.isArray(value)) {
                        value.forEach(v => url += `&${key}[]=${encodeURIComponent(v)}`);
                    } else {
                        url += `&${key}=${encodeURIComponent(value)}`;
                    }
                }
            } else {
                // Обычные параметры для не-bulk методов
                for (const [key, value] of Object.entries(params)) {
                    url += `&${key}=${encodeURIComponent(value)}`;
                }
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            if (!data.ok) throw new Error(data.error || 'Unknown API error');

            return data.result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,

        /**
         * Получение списка всех групп по факультетам
         * @returns {Promise<Array>} Массив факультетов с группами
         */
        getGroups: () => callAPI('groups.get'),

        /**
         * Проверка существования группы
         * @param {string} groupName - Название группы в нижнем регистре
         * @returns {Promise<{available: boolean}>} Объект с доступностью группы
         */
        testGroup: (groupName) => callAPI('groups.test', { groupName }),

        /**
         * Получение списка преподавателей
         * @returns {Promise<Array>} Массив преподавателей
         */
        getTeachers: () => callAPI('teachers.get'),

        /**
         * Получение расписания
         * @param {string} date - Дата в формате YYYY-MM-DD
         * @param {boolean} week - true для недели, false для одного дня
         * @param {Object} target - Цель поиска (один из вариантов)
         * @returns {Promise<Array>} Массив дней с парами
         */
        getPairs: (date, week, target) => {
            const params = { date, week: week ? 1 : 0 };
            if (target.teacherId) params.teacherId = target.teacherId;
            else if (target.teacherLogin) params.teacherLogin = target.teacherLogin;
            else if (target.groupId) params.groupId = target.groupId;
            else if (target.groupName) params.groupName = target.groupName;
            else if (target.query) params.query = target.query;
            else throw new Error('Не указана цель поиска');
            return callAPI('pairs.get', params);
        },

        /**
         * Получение расписания с проверкой доступности
         * @param {string} date - Дата в формате YYYY-MM-DD
         * @param {boolean} week - true для недели, false для одного дня
         * @param {Object} target - Цель поиска (один из вариантов)
         * @returns {Promise<Object>} Объект с доступностью и расписанием
         */
        getConfirmablePairs: (date, week, target) => {
            const params = { date, week: week ? 1 : 0 };
            if (target.teacherId) params.teacherId = target.teacherId;
            else if (target.teacherLogin) params.teacherLogin = target.teacherLogin;
            else if (target.groupId) params.groupId = target.groupId;
            else if (target.groupName) params.groupName = target.groupName;
            else if (target.query) params.query = target.query;
            else throw new Error('Не указана цель поиска');
            return callAPI('pairs.confirmableGet', params);
        },

        /**
         * Массовое получение расписания
         * @param {string} date - Дата в формате YYYY-MM-DD
         * @param {Object} targets - Объект с массивами целей поиска
         * @returns {Promise<Object>} Результат для всех целей
         */
        getBulkPairs: (date, targets) => callAPI('pairs.bulkGet', { date, ...targets }),

        /**
         * Массовое получение расписания с проверкой доступности
         * @param {string} date - Дата в формате YYYY-MM-DD
         * @param {Object} targets - Объект с массивами целей поиска
         * @returns {Promise<Object>} Результат для всех целей с доступностью
         */
        getConfirmableBulkPairs: (date, targets) => callAPI('pairs.confirmableBulkGet', { date, ...targets }),

        /**
         * Получение списка факультетов с доступным расписанием
         * @param {string} date - Дата понедельника в формате YYYY-MM-DD
         * @returns {Promise<Array>} Массив факультетов
         */
        getUpdates: (date) => callAPI('updates.get', { date }),
    };
}

/*

Документация
Импортируйте хук в нужном компоненте:

javascript
import { useScheduleAPI } from './useScheduleAPI';
Используйте хук в вашем компоненте:

javascript
function MyComponent() {
    const {
        loading,
        error,
        getGroups,
        getPairs,
        // другие методы...
    } = useScheduleAPI();

    // Пример использования
    useEffect(() => {
        const loadData = async () => {
            try {
                const groups = await getGroups();
                console.log('Группы:', groups);

                const schedule = await getPairs(
                    '2024-05-20',
                    false,
                    { groupName: '130м' }
                );
                console.log('Расписание:', schedule);
            } catch (err) {
                console.error('Ошибка:', err);
            }
        };

        loadData();
    }, []);
}
Доступные методы
Состояние запроса:

loading - boolean, true во время выполнения запроса
error - string | null, содержит текст ошибки при неудачном запросе

Методы API:

getGroups() - Получение списка всех групп по факультетам
testGroup(groupName) - Проверка существования группы
getTeachers() - Получение списка преподавателей
getPairs(date, week, target) - Получение расписания
getConfirmablePairs(date, week, target) - Получение расписания с проверкой доступности
getBulkPairs(date, targets) - Массовое получение расписания
getConfirmableBulkPairs(date, targets) - Массовое получение расписания с проверкой доступности
getUpdates(date) - Получение списка факультетов с доступным расписанием

Параметры методов
Для методов getPairs и getConfirmablePairs:

date - строка с датой в формате 'YYYY-MM-DD'
week - boolean, true для получения расписания на неделю, false для одного дня
target - объект с одним из полей:
teacherId - ID преподавателя(число)
teacherLogin - логин преподавателя(строка)
groupId - ID группы(число)
groupName - название группы(строка в нижнем регистре)
query - поисковый запрос(строка, минимум 3 символа)
Для bulk методов(getBulkPairs, getConfirmableBulkPairs):
date - строка с датой в формате 'YYYY-MM-DD'
targets - объект, где ключи - типы целей, значения - массивы целей:

javascript
{
    groupName: ['130м', '131м'],
        query: ['219а', '222в']
}

Возвращаемые значения
Каждый метод возвращает Promise, который разрешается в данные, соответствующие формату ответа API(как описано в документации sch_api).В случае ошибки Promise будет отклонен с текстом ошибки.

Обработка ошибок
Рекомендуется использовать try/catch при вызове методов:

javascript
try {
    const result = await apiMethod(params);
    // Обработка успешного результата
} catch (err) {
    console.error('Ошибка:', err);
    // Обработка ошибки
}

Хук также предоставляет состояние ошибки через error, которое обновляется при каждом запросе.

*/
