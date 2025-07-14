import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import FormData from 'form-data';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.use(express.json({ limit: '10mb' }));

app.post('/upload', async (req, res) => {
    try {
        const base64Image = req.body.image;

        if (!base64Image) {
            return res.status(400).json({ error: 'No image provided' });
        }

        const buffer = Buffer.from(base64Image.split(',')[1], 'base64');

        const form = new FormData();
        form.append('chat_id', CHAT_ID);
        form.append('photo', buffer, { filename: 'screenshot.jpg' });

        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, form, {
            headers: form.getHeaders(),
        });

        res.json({ success: true, message: 'Image sent to Telegram' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error sending to Telegram' });
    }
});

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});