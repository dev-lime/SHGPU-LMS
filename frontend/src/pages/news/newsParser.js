import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFileSync } from 'fs';

// Категории и соответствующие URL (новости университета идут последними)
const categories = [
    {
        name: 'Новости науки',
        url: 'https://shspu.ru/news-science/',
        category: 'Наука'
    },
    {
        name: 'Новости спорта',
        url: 'https://shspu.ru/news-sport/',
        category: 'Спорт'
    },
    {
        name: 'Студенческая жизнь',
        url: 'https://shspu.ru/news-student/',
        category: 'Студенческая жизнь'
    },
    {
        name: 'Новости университета',
        url: 'https://shspu.ru/news-university/',
        category: 'Новости'
    }
];

// Счетчик для генерации трехзначных ID
let newsCounter = 0;

// Функция для генерации ID на основе счетчика и хэша заголовка
function generateId(title) {
    // Увеличиваем счетчик и форматируем в трехзначный вид
    const counterPart = (++newsCounter).toString().padStart(3, '0');

    // Создаем хэш из заголовка (4 цифры)
    let titleHash = 0;
    for (let i = 0; i < title.length; i++) {
        const char = title.charCodeAt(i);
        titleHash = ((titleHash << 5) - titleHash) + char;
        titleHash = titleHash & titleHash; // Преобразуем в 32-битное целое число
    }

    // Берем последние 4 цифры хэша
    const hashPart = Math.abs(titleHash).toString().slice(-4).padStart(4, '0');

    return `${counterPart}-${hashPart}`;
}

// Функция для парсинга одной страницы новостей
async function parseNewsPage(url, categoryName) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const newsItems = [];

        // Находим все блоки с новостями
        $('.col-news-panel').each((i, element) => {
            const newsItem = $(element).find('.news-panel');

            // Извлекаем данные
            const title = newsItem.find('.news-title h4').text().trim();
            const date = newsItem.find('.news-date').text().trim();
            const image = newsItem.find('img').attr('src');
            const link = newsItem.find('a').first().attr('href');
            const content = ''; // Контент будет получен при парсинге полной новости

            // Формируем полный URL изображения, если оно есть
            const fullImageUrl = image ? new URL(image, 'https://shspu.ru/').toString() : null;

            // Формируем полный URL новости (убираем дублирование пути)
            let fullLink = null;
            if (link) {
                // Удаляем возможные дублирующиеся части пути (например, "news-science/")
                const cleanLink = link.replace(/^\/?news-[^\/]+\//, '/');
                fullLink = new URL(cleanLink, 'https://shspu.ru/').toString();
            }

            newsItems.push({
                id: generateId(title),
                title,
                date,
                image: fullImageUrl,
                link: fullLink,
                content,
                category: categoryName
            });
        });

        return newsItems;
    } catch (error) {
        console.error(`Ошибка при парсинге ${url}:`, error.message);
        return [];
    }
}

// Функция для парсинга полного текста новости (только первый абзац)
async function parseFullNews(newsItem) {
    if (!newsItem.link) return newsItem;

    try {
        const response = await axios.get(newsItem.link);
        const $ = cheerio.load(response.data);

        // Ищем первый абзац в разных возможных контейнерах
        let firstParagraph = '';

        // Вариант 1: Ищем в div с id="cXXXX" (где XXXX - число)
        const contentDiv = $('div[id^="c"] .csc-default p').first();
        if (contentDiv.length) {
            firstParagraph = contentDiv.text().trim();
        }

        // Вариант 2: Если первый вариант не сработал, ищем в основном контенте
        if (!firstParagraph) {
            firstParagraph = $('.content-full-news p, .full-news p').first().text().trim();
        }

        // Вариант 3: Если абзац не найден, попробуем извлечь из meta-описания
        if (!firstParagraph) {
            firstParagraph = $('meta[name="description"]').attr('content') || '';
        }

        // Очищаем текст от лишних пробелов и переносов
        firstParagraph = firstParagraph.trim();

        // Удаляем подписи (если начинаются с "Фото:" или содержат "©")
        if (firstParagraph.startsWith('Фото:') || firstParagraph.includes('©')) {
            firstParagraph = '';
        }

        return {
            ...newsItem,
            content: firstParagraph || 'Текст новости не найден'
        };
    } catch (error) {
        console.error(`Ошибка при парсинге полной новости ${newsItem.link}:`, error.message);
        return newsItem;
    }
}

// Основная функция
async function main() {
    const allNews = [];
    const uniqueIds = new Set();

    // Парсим новости для каждой категории
    for (const category of categories) {
        console.log(`Парсинг категории: ${category.name}`);
        const newsItems = await parseNewsPage(category.url, category.category);

        // Парсим полный текст для каждой новости
        for (let i = 0; i < Math.min(newsItems.length, 10); i++) { // Ограничиваем 10 новостями на категорию
            const newsItem = newsItems[i];

            // Проверяем, есть ли уже новость с таким ID
            if (!uniqueIds.has(newsItem.id)) {
                uniqueIds.add(newsItem.id);

                // Для новостей университета проверяем, не были ли они уже добавлены из других категорий
                if (category.category !== 'Новости' || !uniqueIds.has(newsItem.id)) {
                    const fullNews = await parseFullNews(newsItem);
                    allNews.push(fullNews);
                }
            }
        }
    }

    // Сохраняем результаты в JSON файл
    const jsonData = JSON.stringify(allNews, null, 2);
    writeFileSync('news-data.json', jsonData, 'utf8');

    console.log(`Парсинг завершен. Сохранено ${allNews.length} уникальных новостей.`);
}

// Запускаем парсер
main();
