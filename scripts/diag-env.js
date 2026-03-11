
console.log('--- Threads Environment Status ---');
console.log(`THREADS_APP_ID: ${process.env.THREADS_APP_ID ? 'SET' : 'MISSING'}`);
console.log(`THREADS_APP_SECRET: ${process.env.THREADS_APP_SECRET ? 'SET' : 'MISSING'}`);
console.log('--- Other Platforms ---');
console.log(`INSTAGRAM_APP_ID: ${process.env.INSTAGRAM_APP_ID ? 'SET' : 'MISSING'}`);
console.log(`TIKTOK_CLIENT_KEY: ${process.env.TIKTOK_CLIENT_KEY ? 'SET' : 'MISSING'}`);
console.log(`YOUTUBE_CLIENT_ID: ${process.env.YOUTUBE_CLIENT_ID ? 'SET' : 'MISSING'}`);
console.log('---------------------------------');
