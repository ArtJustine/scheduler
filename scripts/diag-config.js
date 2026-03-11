
const { isPlatformConfigured, config } = require('./lib/config');

console.log('--- Platform Configuration Status ---');
const platforms = ['instagram', 'tiktok', 'youtube', 'facebook', 'twitter', 'linkedin', 'pinterest', 'threads', 'bluesky'];

platforms.forEach(p => {
    const configured = isPlatformConfigured(p);
    console.log(`${p}: ${configured ? '✓ Configured' : '✗ NOT Configured'}`);
    if (!configured && p === 'threads') {
        console.log(`  - THREADS_APP_ID: ${process.env.THREADS_APP_ID ? 'SET' : 'MISSING'}`);
        console.log(`  - THREADS_APP_SECRET: ${process.env.THREADS_APP_SECRET ? 'SET' : 'MISSING'}`);
    }
});
console.log('-----------------------------------');
