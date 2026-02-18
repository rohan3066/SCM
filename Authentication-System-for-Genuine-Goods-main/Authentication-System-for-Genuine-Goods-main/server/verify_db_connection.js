const db = require('./config');

async function test() {
    try {
        console.log('Attempting to connect to database...');
        await db.connect();
        console.log('Successfully connected to database!');
        const res = await db.query('SELECT NOW()');
        console.log('Current database time:', res.rows[0]);
        await db.end();
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err);
        process.exit(1);
    }
}

test();
