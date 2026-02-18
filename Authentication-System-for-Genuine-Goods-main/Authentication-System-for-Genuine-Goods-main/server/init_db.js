const fs = require('fs');
const path = require('path');
const db = require('./config');

async function initDb() {
    try {
        const schemaPath = path.join(__dirname, 'migrations', '001_init_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Connecting to database...');
        await db.connect();

        console.log('Running migration...');
        await db.query(schemaSql);

        console.log('Migration successful!');
        await db.end();
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

initDb();
