const fetch = require('node-fetch');

const botToken = "8734809607:AAEEUTV-TS83qGV0Vf_zVD2fxb5GoCgPaS0";
const chatId = "774881727";

console.log("Testing Telegram API with Bot:", botToken, "and Chat ID:", chatId);

fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: 'Test message directly from API check' })
})
.then(res => res.json())
.then(json => console.log('Telegram APIs responded with:', json))
.catch(err => console.error('Fetch error:', err));
