import('dotenv/config').then(() => {
    const fetch = require('node-fetch');
    const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
    
    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: 'Test from IsoQuest Feedback System Fix' })
    })
    .then(res => res.json())
    .then(json => console.log('Telegram API Response:', json))
    .catch(err => console.error('Telegram API Error:', err));
});
