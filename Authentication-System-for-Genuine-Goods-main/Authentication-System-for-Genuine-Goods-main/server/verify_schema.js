const db = require('./config');

async function verify() {
    try {
        console.log('Verifying schema...');
        await db.connect();
        const res = await db.query('SELECT count(*) FROM manufacturer');
        console.log('Manufacturer count:', res.rows[0].count);
        await db.end();
        process.exit(0);
    } catch (err) {
        console.error('Verification failed:', err);
        process.exit(1);
    }
}

verify();
