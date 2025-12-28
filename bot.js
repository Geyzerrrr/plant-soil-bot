const fetch = require('node-fetch');

// Токен будет устанавливаться через переменные окружения на Railway
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ПОЛНАЯ БАЗА РЕЦЕПТОВ ДЛЯ ВСЕХ СЕМЕЙСТВ
const SOIL_RECIPES = {
  "Орхидные": {
    "растения": ["Фаленопсис", "Ванда", "Дендробиум", "Цимбидиум", "Пафиопедилум"],
    "состав": [
      {"компонент": "Кора сосны средней фракции", "процент": 50},
      {"компонент": "Мох сфагнум", "процент": 20},
      {"компонент": "Древесный уголь", "процент": 20},
      {"компонент": "Перлит/керамзит", "процент": 10}
    ],
    "советы": [
      "🌱 Дренажный слой 3-5 см обязателен",
      "💧 Полив только после полного просыхания коры",
      "☀️ Яркий рассеянный свет"
    ]
  },
  
  "Ароидные": {
    "растения": ["Монстера", "Филодендрон", "Алоказия", "Антуриум", "Замиокулькас"],
    "состав": [
      {"компонент": "Универсальный грунт", "процент": 40},
      {"компонент": "Кокосовый субстрат", "процент": 20},
      {"компонент": "Перлит", "процент": 20},
      {"компонент": "Древесный уголь", "процент": 10},
      {"компонент": "Кора сосны", "процент": 10}
    ],
    "советы": [
      "🌡️ Любят тепло (20-25°C)",
      "💦 Высокая влажность воздуха",
      "🚫 Боятся сквозняков"
    ]
  },
  
  "Кактусовые": {
    "растения": ["Кактусы", "Опунция", "Эпифиллум", "Шлюмбергера"],
    "состав": [
      {"компонент": "Листовая земля", "процент": 30},
      {"компонент": "Крупный песок", "процент": 30},
      {"компонент": "Мелкий гравий", "процент": 20},
      {"компонент": "Древесный уголь", "процент": 10},
      {"компонент": "Кирпичная крошка", "процент": 10}
    ],
    "советы": [
      "☀️ Максимум света",
      "💧 Полив редкий",
      "❄️ Зимовка при +10-15°C"
    ]
  }
};

// Ключевые слова для поиска
const KEYWORDS = {
  'помощь': 'помощь',
  'все растения': 'все_растения',
  'о создателе': 'о_создателе',
  'орхидея': 'Орхидные',
  'монстера': 'Ароидные',
  'филодендрон': 'Ароидные',
  'кактус': 'Кактусовые',
  'фикус': 'Тутовые',
  'суккулент': 'Толстянковые',
  'бегония': 'Бегониевые',
  'драцена': 'Спаржевые',
  'кротон': 'Молочайные',
  'гибискус': 'Мальвовые'
};

// Функция отправки сообщения
async function sendMessage(chatId, text, parseMode = 'HTML', replyMarkup = null) {
  const url = `${TELEGRAM_API}/sendMessage`;
  
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: parseMode
  };
  
  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    return await response.json();
  } catch (error) {
    console.error('Send message error:', error);
    return { ok: false, error: error.message };
  }
}

// Форматирование рецепта
function formatRecipe(family, recipe) {
  let message = `<b>🌱 ГРУНТ ДЛЯ ${family.toUpperCase()}</b>\n\n`;
  
  if (recipe.растения && recipe.растения.length > 0) {
    const plants = recipe.растения.slice(0, 5).join(', ');
    message += `<i>Подходит для: ${plants}</i>\n\n`;
  }
  
  message += `<b>📊 СОСТАВ:</b>\n`;
  recipe.состав.forEach(item => {
    message += `• ${item.компонент} — <b>${item.процент}%</b>\n`;
  });
  
  if (recipe.советы && recipe.советы.length > 0) {
    message += `\n<b>💡 СОВЕТЫ:</b>\n`;
    recipe.советы.forEach(tip => {
      message += `${tip}\n`;
    });
  }
  
  return message;
}

// Поиск семейства
function findFamily(text) {
  const lowerText = text.toLowerCase().trim();
  
  if (lowerText.includes('помощь')) return 'помощь';
  if (lowerText.includes('все растения')) return 'все_растения';
  if (lowerText.includes('о создателе')) return 'о_создателе';
  
  for (const [keyword, family] of Object.entries(KEYWORDS)) {
    if (lowerText.includes(keyword)) {
      if (SOIL_RECIPES[family] || ['помощь', 'все_растения', 'о_создателе'].includes(family)) {
        return family;
      }
    }
  }
  
  return null;
}

// Обработчик для Railway
module.exports = async (req, res) => {
  console.log('Request received:', req.method);
  
  // Проверяем токен
  if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
    console.error('BOT_TOKEN not set!');
    return res.status(500).json({ error: 'Bot token not configured' });
  }
  
  // GET запрос - статусная страница
  if (req.method === 'GET') {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>🌿 Plant Soil Bot</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f9f0;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          }
          h1 {
            color: #2e7d32;
            text-align: center;
          }
          .status {
            background: #4caf50;
            color: white;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🌿 Plant Soil Bot</h1>
          <div class="status">✅ Бот работает корректно!</div>
          <p>Бот для подбора грунта для комнатных растений.</p>
          <p>Бот активен. База содержит ${Object.keys(SOIL_RECIPES).length} семейств растений.</p>
        </div>
      </body>
      </html>
    `;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(html);
  }
  
  // POST запрос от Telegram
  if (req.method === 'POST') {
    try {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const update = JSON.parse(body);
          
          if (update.message) {
            const chatId = update.message.chat.id;
            const text = update.message.text || '';
            
            const requestType = findFamily(text) || 'unknown';
            
            if (requestType === 'помощь') {
              await sendMessage(chatId, 'Напишите название растения: орхидея, монстера, кактус и т.д.');
            } 
            else if (requestType === 'все_растения') {
              let list = '<b>Доступные растения:</b>\n\n';
              for (const family in SOIL_RECIPES) {
                list += `• ${family}\n`;
              }
              await sendMessage(chatId, list);
            }
            else if (requestType === 'о_создателе') {
              await sendMessage(chatId, 'Бот создан для помощи любителям растений 🌿');
            }
            else if (SOIL_RECIPES[requestType]) {
              const recipe = SOIL_RECIPES[requestType];
              const response = formatRecipe(requestType, recipe);
              await sendMessage(chatId, response);
            }
            else if (text === '/start') {
              await sendMessage(chatId, 'Привет! Я помогу подобрать грунт для растений. Напишите название растения.');
            }
            else {
              await sendMessage(chatId, 'Растение не найдено. Попробуйте: орхидея, монстера, кактус');
            }
          }
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
          
        } catch (error) {
          console.error('Error processing update:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      
    } catch (error) {
      console.error('Server error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  } else {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
};
