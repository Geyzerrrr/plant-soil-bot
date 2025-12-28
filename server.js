const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Токен бота
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Упрощенная база рецептов
const SOIL_RECIPES = {
  "Орхидные": {
    "растения": ["Фаленопсис", "Ванда", "Дендробиум"],
    "состав": [
      {"компонент": "Кора сосны", "процент": 50},
      {"компонент": "Мох сфагнум", "процент": 20},
      {"компонент": "Древесный уголь", "процент": 20},
      {"компонент": "Перлит", "процент": 10}
    ]
  },
  "Ароидные": {
    "растения": ["Монстера", "Филодендрон", "Антуриум"],
    "состав": [
      {"компонент": "Универсальный грунт", "процент": 40},
      {"компонент": "Кокосовый субстрат", "процент": 20},
      {"компонент": "Перлит", "процент": 20},
      {"компонент": "Древесный уголь", "процент": 10}
    ]
  },
  "Кактусовые": {
    "растения": ["Кактусы", "Опунция", "Шлюмбергера"],
    "состав": [
      {"компонент": "Листовая земля", "процент": 30},
      {"компонент": "Песок", "процент": 30},
      {"компонент": "Гравий", "процент": 20},
      {"компонент": "Древесный уголь", "процент": 10}
    ]
  }
};

// Функция отправки сообщения
async function sendMessage(chatId, text) {
  try {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Главная страница
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>🌿 Plant Soil Bot</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 600px;
          width: 100%;
          text-align: center;
        }
        h1 {
          color: #2e7d32;
          margin-bottom: 20px;
        }
        .status {
          background: #4caf50;
          color: white;
          padding: 15px;
          border-radius: 10px;
          margin: 20px 0;
          font-weight: bold;
          font-size: 18px;
        }
        .info {
          background: #f5f9f0;
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🌿 Plant Soil Bot</h1>
        <div class="status">✅ Бот работает корректно!</div>
        <div class="info">
          <p>Бот для подбора грунта для комнатных растений</p>
          <p>Баз данных: ${Object.keys(SOIL_RECIPES).length} семейств</p>
          <p>Порт: ${PORT}</p>
          <p>Токен установлен: ${BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE' ? '✅ Да' : '❌ Нет'}</p>
        </div>
        <p>Используйте Telegram бота для работы с системой</p>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

// Webhook endpoint для Telegram
app.post('/webhook', async (req, res) => {
  try {
    const update = req.body;
    
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text || '';
      const firstName = update.message.from.first_name || 'друг';
      
      console.log(`Received message from ${chatId}: ${text}`);
      
      // Обработка команд
      if (text === '/start') {
        await sendMessage(chatId, `Привет, ${firstName}! 🌿\nЯ помогу подобрать грунт для растений.\n\nНапишите название растения:\n• орхидея\n• монстера\n• кактус\n• фикус`);
      } 
      else if (text.toLowerCase().includes('орхидея')) {
        const recipe = SOIL_RECIPES["Орхидные"];
        const response = `<b>🌱 ГРУНТ ДЛЯ ОРХИДНЫХ</b>\n\n<b>Состав:</b>\n${recipe.состав.map(item => `• ${item.компонент} — ${item.процент}%`).join('\n')}`;
        await sendMessage(chatId, response);
      }
      else if (text.toLowerCase().includes('монстера') || text.toLowerCase().includes('филодендрон')) {
        const recipe = SOIL_RECIPES["Ароидные"];
        const response = `<b>🌱 ГРУНТ ДЛЯ АРОИДНЫХ</b>\n\n<b>Состав:</b>\n${recipe.состав.map(item => `• ${item.компонент} — ${item.процент}%`).join('\n')}`;
        await sendMessage(chatId, response);
      }
      else if (text.toLowerCase().includes('кактус')) {
        const recipe = SOIL_RECIPES["Кактусовые"];
        const response = `<b>🌱 ГРУНТ ДЛЯ КАКТУСОВЫХ</b>\n\n<b>Состав:</b>\n${recipe.состав.map(item => `• ${item.компонент} — ${item.процент}%`).join('\n')}`;
        await sendMessage(chatId, response);
      }
      else if (text.toLowerCase().includes('помощь')) {
        await sendMessage(chatId, '<b>❓ Помощь</b>\n\nНапишите название растения:\n• орхидея\n• монстера\n• кактус\n• фикус\n\nИли используйте команды:\n/start - начать диалог\n\nБот подберет правильный состав грунта!');
      }
      else {
        await sendMessage(chatId, 'Попробуйте написать: орхидея, монстера или кактус');
      }
    }
    
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Альтернативный endpoint для совместимости
app.post('/', async (req, res) => {
  try {
    const update = req.body;
    
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text || '';
      
      // Простая обработка
      if (text === '/start') {
        await sendMessage(chatId, 'Привет! Напишите название растения: орхидея, монстера, кактус');
      }
    }
    
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    bot_token_set: BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE'
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🤖 Bot token: ${BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE' ? 'Set' : 'NOT SET!'}`);
});
