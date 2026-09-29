const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const token = process.env.BOT_TOKEN;
const adminChatId = process.env.ADMIN_CHAT_ID;

if (!token) {
  console.error("BOT_TOKEN is missing.");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

const userData = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `👋 Welcome to our Customer Support Bot!

How can we help you today?`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📦 Our Services", callback_data: "services" },
            { text: "💰 Pricing", callback_data: "pricing" }
          ],
          [
            { text: "❓ FAQ", callback_data: "faq" },
            { text: "📞 Contact Us", callback_data: "contact" }
          ],
          [
            { text: "📝 Request a Quote", callback_data: "quote" }
          ]
        ]
      }
    }
  );
});

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const action = query.data;

  await bot.answerCallbackQuery(query.id);

  if (action === "services") {
    bot.sendMessage(
      chatId,
      `📦 OUR SERVICES

• Website Development
• Telegram Bots
• WhatsApp Bots
• AI Automation
• E-commerce Solutions

Choose "Request a Quote" if you would like more information.`
    );
  }

  if (action === "pricing") {
    bot.sendMessage(
      chatId,
      `💰 PRICING

Our prices depend on the service and project requirements.

Click "Request a Quote" to tell us what you need and we'll provide a custom quote.`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "📝 Request a Quote", callback_data: "quote" }]
          ]
        }
      }
    );
  }

  if (action === "faq") {
    bot.sendMessage(
      chatId,
      `❓ FREQUENTLY ASKED QUESTIONS

Q: How quickly can you start?
A: After reviewing your requirements.

Q: Can I request a custom service?
A: Yes.

Q: How do I get a quote?
A: Click "Request a Quote" and provide your project details.`
    );
  }

  if (action === "contact") {
    bot.sendMessage(
      chatId,
      `📞 CONTACT US

Please use "Request a Quote" and we'll get back to you.

You can also send your question directly in this chat.`
    );
  }

  if (action === "quote") {
    userData[chatId] = {
      step: "name"
    };

    bot.sendMessage(
      chatId,
      "📝 REQUEST A QUOTE\n\nWhat is your name?"
    );
  }
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith("/")) return;
  if (!userData[chatId]) return;

  const data = userData[chatId];

  if (data.step === "name") {
    data.name = text;
    data.step = "service";

    bot.sendMessage(
      chatId,
      "Thanks! 👍\n\nWhat service do you need?"
    );

    return;
  }

  if (data.step === "service") {
    data.service = text;
    data.step = "budget";

    bot.sendMessage(
      chatId,
      "What is your estimated budget?"
    );

    return;
  }

  if (data.step === "budget") {
    data.budget = text;
    data.step = "details";

    bot.sendMessage(
      chatId,
      "Please describe your project or what you need help with."
    );

    return;
  }

  if (data.step === "details") {
    data.details = text;

    const leadMessage = `
🔔 NEW CUSTOMER LEAD

👤 Name: ${data.name}
📦 Service: ${data.service}
💰 Budget: ${data.budget}

📝 Details:
${data.details}

💬 Telegram:
${msg.from.username ? "@" + msg.from.username : "No username"}

🆔 Chat ID:
${chatId}
`;

    if (adminChatId) {
      bot.sendMessage(adminChatId, leadMessage);
    }

    bot.sendMessage(
      chatId,
      `✅ Thank you, ${data.name}!

Your request has been received.

We'll review your information and get back to you shortly.`
    );

    delete userData[chatId];
  }
});

bot.on("polling_error", (error) => {
  console.error("Polling error:", error.message);
});

console.log("Telegram Support Bot is running...");
