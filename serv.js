const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors'); // Для разрешения CORS

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Для разрешения запросов с других доменов

// Токен вашего Telegram-бота
const botToken = '7809691512:AAHmFFAGkXu34oW3IujqoTcTmiwzs66Hwe0'; // Замените на токен вашего бота
const bot = new TelegramBot(botToken);

// Объект для хранения пользователей
let users = {};

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username || 'Гость'; // Если нет username, используем 'Гость'

    // Сохраняем данные пользователя
    users[chatId] = {
        username: `@${username}`, // Добавляем @ перед username
        photo_url: msg.from.photo_url || 'default_avatar.jpg', // Если есть фото, сохраняем его
        id: chatId,
    };

    bot.sendMessage(chatId, `Привет, ${username}! Вы успешно авторизованы.`);
});

// Эндпоинт для получения данных пользователя
app.get('/user-status', (req, res) => {
    const { id } = req.query; // Получаем ID пользователя из query-параметра

    // Если пользователь найден, возвращаем его данные
    if (users[id]) {
        res.json(users[id]); // Возвращаем данные пользователя (username и фото)
    } else {
        // Если пользователь не найден, возвращаем ошибку
        res.status(404).json({ error: 'Пользователь не найден.' });
    }
});

// Установка вебхука для Telegram
app.post('/setWebhook', (req, res) => {
    const webhookUrl = 'https://server-93b5.onrender.com/webhook'; // Замените на ваш URL
    bot.setWebHook(webhookUrl)
        .then(() => res.send({ success: true }))
        .catch(err => res.status(500).send({ error: err.message }));
});

// Обработка вебхуков от Telegram
app.post('/webhook', (req, res) => {
    const message = req.body.message;

    if (message) {
        const chatId = message.chat.id;
        const username = message.from.username || 'Гость';

        // Сохраняем или обновляем данные пользователя
        users[chatId] = {
            username: `@${username}`,
            photo_url: message.from.photo_url || 'default_avatar.jpg',
            id: chatId,
        };

        bot.sendMessage(chatId, `Привет, ${username}! Вы успешно авторизованы.`);
    }

    // Отправляем успешный статус ответа
    res.sendStatus(200);
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));

