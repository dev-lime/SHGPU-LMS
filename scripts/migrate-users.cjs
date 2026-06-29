/* global process */
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

admin.initializeApp({
    credential: admin.cert(serviceAccount)
});

const db = getFirestore();

const ACCOUNT_TYPE_MAP = {
    support: 'employee'
};

function splitFullName(fullName) {
    if (!fullName || typeof fullName !== 'string') {
        return { lastName: '', firstName: '', patronymic: '' };
    }
    const parts = fullName.trim().split(/\s+/);
    return {
        lastName: parts[0] || '',
        firstName: parts[1] || '',
        patronymic: parts[2] || ''
    };
}

async function migrateUsers() {
    const snapshot = await db.collection('users').get();

    console.log(`Найдено ${snapshot.size} пользователей.`);

    let migrated = 0;
    let skipped = 0;

    for (const doc of snapshot.docs) {
        const data = doc.data();

        if (data.schemaVersion && data.schemaVersion >= 2) {
            console.log(`  [SKIP] ${doc.id}: уже schemaVersion=${data.schemaVersion}`);
            skipped++;
            continue;
        }

        const { lastName, firstName, patronymic } = splitFullName(data.fullName);

        const update = {
            schemaVersion: 2,
            lastName,
            firstName,
            patronymic
        };

        if (data.accountType && ACCOUNT_TYPE_MAP[data.accountType]) {
            update.accountType = ACCOUNT_TYPE_MAP[data.accountType];
        }

        if (data.accountType === 'student' && !data.studentId) {
            update.studentId = data.studentGroup || '';
        }

        if (!data.lastOnline) {
            update.lastOnline = null;
        }

        await db.collection('users').doc(doc.id).update(update);

        console.log(`  [OK] ${doc.id}: ${data.fullName || '?'} → ${lastName} ${firstName} ${patronymic}` +
            (update.accountType ? ` (accountType: ${data.accountType} → ${update.accountType})` : ''));
        migrated++;
    }

    console.log(`\nГотово: ${migrated} мигрировано, ${skipped} пропущено.`);
}

migrateUsers().catch(error => {
    console.error('Ошибка миграции:', error);
    process.exit(1);
});
