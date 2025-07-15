import express from 'express'
import fs from "fs";
import path from "path";
import puppeteer from 'puppeteer'
import axios from 'axios'
import cors from 'cors'
import FormData from 'form-data'

const app = express();
app.use(cors())
const PORT = 3000;


app.use(express.json({ limit: '10mb' }));

app.post('/upload', async (req, res) => {
    const { filename, content } = req.body;

    if (!filename || !content) {
        return res.status(400).send('❌ Missing filename or content');
    }

    const screenshotsDir = path.dirname('screenshots');
    if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

    const timestamp = Date.now();
    const screenshotPath = path.join(screenshotsDir, `${timestamp}-${filename.replace(/\.html$/, '')}.png`);

    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.setContent(content, { waitUntil: 'networkidle0' });
        await page.screenshot({ path: screenshotPath });
        await browser.close();

        // 📤 Отправка в Telegram
        const formData = new FormData();
        const buffer = fs.readFileSync(screenshotPath); // ← Получаем Buffer

        const filename = path.basename(screenshotPath); // ← Имя файла

        formData.append('chat_id', process.env.CHAT_ID);
        formData.append('caption', '📎 Скриншот HTML');
        formData.append('photo', buffer, filename); // ← Передаём как буфер с именем


        await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`, formData, {
            headers: formData.getHeaders(),
        });

        res.send('✅ Скриншот отправлен в Telegram!');
    } catch (err) {
        console.error('❌ Ошибка:', err);
        res.status(500).send('Ошибка при создании или отправке скриншота');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});