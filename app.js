const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const app = express();

app.use(express.json());

// const client = new Client({
//     authStrategy: new LocalAuth()
// });
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});


client.on('qr', qr => {
    console.log('Scan this QR code:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp is ready!');
});

client.initialize();

app.post('/send', async (req, res) => {
    const { number, message } = req.body;
    if (!number || !message) {
        return res.status(400).send({ error: 'number and message required' });
    }

    const chatId = number.includes('@c.us') ? number : `${number}@c.us`;

    try {
        await client.sendMessage(chatId, message);
        res.send({ success: true });
    } catch (err) {
        res.status(500).send({ error: err.toString() });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
