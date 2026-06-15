import axios from 'axios';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_URL = 'https://shspu.ru/sch_api/index.php';

function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().slice(0, 10);
}

function formatDate(date) {
    return date.toISOString().slice(0, 10);
}

async function fetchWeek(monday, groupId) {
    const response = await axios.get(API_URL, {
        params: { method: 'pairs.get', date: monday, week: 1, groupId }
    });
    return response.data.result || [];
}

async function main() {
    const groupId = process.argv[2] || '56';

    const today = new Date();
    const monday = getMonday(today);

    let allData = await fetchWeek(monday, groupId);

    const jsonData = JSON.stringify(allData, null, 4);
    writeFileSync(resolve(__dirname, 'schedule-data.json'), jsonData, 'utf8');

    const pairCount = allData.reduce((sum, day) => sum + (day.pairs?.length || 0), 0);
    console.log(`Расписание (группа ${groupId}) сохранено. Дней: ${allData.length}, пар: ${pairCount}`);
}

main().then(() => process.exit(0)).catch((err) => {
    console.error('Парсинг расписания завершился ошибкой:', err);
    process.exit(1);
});
