"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generative_ai_1 = require("@google/generative-ai");
const grammy_1 = require("grammy");
const files_1 = require("@grammyjs/files");
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const supabase_js_1 = require("@supabase/supabase-js");
const client = process.env.CLIENT_URL;
const anon = process.env.ANON_KEY;
const api_gemini_key = process.env.GEMINI_API_KEY;
const token = process.env.BOT_TOKEN;
if (!token)
    throw new Error("BOT_TOKEN is unset");
if (!client)
    throw new Error("CLIENT_URL is unset");
if (!anon)
    throw new Error("ANON_KEY is unset");
if (!api_gemini_key)
    throw new Error("GEMINI_API_KEY is unset");
const supabase = (0, supabase_js_1.createClient)(client, anon);
const genAI = new generative_ai_1.GoogleGenerativeAI(api_gemini_key);
const bot = new grammy_1.Bot(token);
bot.api.config.use((0, files_1.hydrateFiles)(bot.token));
console.log("Bot is up and running!");
const start_keyboard = ["🔃 Reset Chat", "🌐 Languages", "📚 About", "📞 Contact"];
const buttonRows = [
    [grammy_1.Keyboard.text(start_keyboard[0])], // Reset Chat in its own row at the top
    [grammy_1.Keyboard.text(start_keyboard[1]), grammy_1.Keyboard.text(start_keyboard[2]), grammy_1.Keyboard.text(start_keyboard[3])] // Other buttons in the second row
];
const keyboard = grammy_1.Keyboard.from(buttonRows).resized();
// start
bot.command("start", async (ctx) => {
    if (!ctx.from) {
        await ctx.reply("There was an issue registering you❌. Please try again later. We might be updating the Bot🤖");
        return;
    }
    const userId = ctx.from.id; // Use ctx.from.id directly
    const username = ctx.from.username || null;
    // Attempt to retrieve the user
    const { data: users, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId);
    // Check if 'users' is not null and then if it's empty
    if (users && users.length === 0 && !selectError) {
        // If no user exists and no error, try to insert the new user
        const { error: insertError } = await supabase
            .from('users')
            .insert([
            { user_id: userId, username: username }
        ]);
        if (insertError) {
            console.error('Error inserting new user:', insertError);
            await ctx.reply("There was an issue registering you❌. Please try again later. We might be updating the Bot🤖");
            return;
        }
    }
    else if (selectError) {
        // If there was an error querying the user
        console.error('Error checking user existence:', selectError);
        await ctx.reply("There was an issue accessing your information. Please try again later. We might be updating the Bot🤖");
        return;
    }
    const welcomeMessage = `🤖 Welcome to *Mali*, your personal AI Assistant powered by Google's *Gemini Pro*\\!\n\n` +
        `🚀I excel in coding and writing tasks\\.\n\n` +
        `🌐Explore *Supported Languages* for customization\\.\n\n` +
        `🔄 *memory of past conversations*\\.\n\n` +
        `🖼️ *Send me an image and ask anything*\\! I can provide insights based on images too\\.\n\n` +
        `Ready\\? Ask me anything\\!`;
    await ctx.reply(welcomeMessage, {
        parse_mode: "MarkdownV2", reply_markup: keyboard,
    });
});
bot.command("reset", async (ctx) => {
    if (!ctx.from) {
        await ctx.reply("Unable to perform operation.");
        return;
    }
    const userId = ctx.from.id;
    try {
        // Reset the user's chat history in the database
        await supabase
            .from('users')
            .update({ chats: [] }) // Set chats to an empty array
            .eq('user_id', userId);
        await ctx.reply("Your chat history has been cleared✅. Start fresh!🙂");
    }
    catch (error) {
        console.error('Error clearing chat history:', error);
        await ctx.reply("Sorry, there was an error clearing your chat history❌. Please try again.🤖");
    }
});
bot.hears("🔃 Reset Chat", async (ctx) => {
    if (!ctx.from) {
        await ctx.reply("Unable to perform operation.");
        return;
    }
    const userId = ctx.from.id;
    try {
        // Reset the user's chat history in the database
        await supabase
            .from('users')
            .update({ chats: [] }) // Set chats to an empty array
            .eq('user_id', userId);
        await ctx.reply("Your chat history has been cleared✅. Start fresh!🙂");
    }
    catch (error) {
        console.error('Error clearing chat history:', error);
        await ctx.reply("Sorry, there was an error clearing your chat history❌. Please try again.🤖");
    }
});
bot.hears("📚 About", async (ctx) => {
    const aboutMessage = "🚧 *About Mali v1\\.2* 🚧\n\n" +
        "\\- 🤖 AI Assistant powered by Google's Gemini Pro API\\.\n" +
        "\\- 🎯 High accuracy in Q&A, coding, and creative writing\\.\n" +
        "\\- 🛠 Markdown support for code snippets\\.\n" +
        "\\- 📈 Capabilities: coding assistance, creative writing, and answering based on image context 🖼️\\.\n" + // Added capability with emoji
        "\\- 🔄 *memory of past conversations* \\(Added ✅\\)\\.\n" +
        "\\- 🗺 Explore *Supported Languages*\\.\n" +
        "\\- 🔜 More features in development\\.\n\n" +
        "🚀 Ready to assist\\! Ask anything\\!";
    await ctx.reply(aboutMessage, {
        parse_mode: "MarkdownV2",
    });
});
// languages
bot.hears("🌐 Languages", async (ctx) => {
    const languages = ["Arabic (ar)", "Bengali (bn)", "Bulgarian (bg)", "Chinese (zh) [Simplified and Traditional]", "Croatian (hr)", "Czech (cs)", "Danish (da)", "Dutch (nl)", "English (en)", "Estonian (et)", "Finnish (fi)", "French (fr)", "German (de)", "Greek (el)", "Hebrew (iw)", "Hindi (hi)", "Hungarian (hu)", "Indonesian (id)", "Italian (it)", "Japanese (ja)", "Korean (ko)", "Latvian (lv)", "Lithuanian (lt)", "Norwegian (no)", "Polish (pl)", "Portuguese (pt)", "Romanian (ro)", "Russian (ru)", "Serbian (sr)", "Slovak (sk)", "Slovenian (sl)", "Spanish (es)", "Swahili (sw)", "Swedish (sv)", "Thai (th)", "Turkish (tr)", "Ukrainian (uk)", "Vietnamese (vi)"];
    const languagesMessage = `Gemini Pro supports the following languages:\n\n- ${languages.join("\n- ")}\n\nIf your language is not listed, please use the English language for the best results.❤️‍🔥`;
    await ctx.reply(languagesMessage);
});
//contact
bot.hears("📞 Contact", async (ctx) => {
    const contactMessage = `📞 *Contact* 📞\n\n📧 *Email*: \`mani@maniw\\.space\`\n💡 *For Collaborations or Suggestions*\\: Feel free to reach out to us via email\\.`;
    await ctx.reply(contactMessage, { parse_mode: "MarkdownV2" });
});
// image messages
bot.on('message:photo', async (ctx) => {
    var _a, _b, _c;
    if (!ctx.from) {
        await ctx.reply("Unable to retrieve user information.");
        return;
    }
    const userId = ctx.from.id; // Extract the user ID from the context
    const photo = (_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.photo) === null || _b === void 0 ? void 0 : _b.slice(-1)[0];
    if (!photo)
        return;
    const prompt = ((_c = ctx.message) === null || _c === void 0 ? void 0 : _c.caption) || "An image is provided without any caption. Describing what I see.";
    // Fetch the user's chat history from the database
    const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('chats')
        .eq('user_id', userId)
        .single();
    if (fetchError || !user) {
        console.error('Error fetching user chat history:', fetchError);
        await ctx.reply("Sorry, I encountered an error while retrieving your chat history.");
        return;
    }
    // Assuming you have a function to handle the conversion of the file to a format your model accepts
    const file = await ctx.getFile();
    const fileName = crypto_1.default.randomBytes(16).toString('hex') + ".jpg";
    const filePath = path_1.default.join("/tmp", fileName);
    await file.download(filePath);
    const mimeType = "image/jpeg";
    // Placeholder for conversion, adjust according to your implementation
    const generativePart = fileToGenerativePart(filePath, mimeType);
    await ctx.replyWithChatAction('typing');
    let typing = true;
    const typingInterval = setInterval(() => {
        if (typing)
            ctx.replyWithChatAction('typing');
    }, 5000);
    try {
        const chatHistory = user.chats || [];
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
        const result = await model.generateContent([prompt, generativePart,]);
        const response = await result.response;
        const text = await response.text();
        const updatedChatHistory = [...chatHistory, { parts: prompt, role: 'user' }, { parts: text, role: 'model' }];
        await supabase
            .from('users')
            .update({ chats: updatedChatHistory })
            .eq('user_id', userId);
        typing = false;
        clearInterval(typingInterval);
        await ctx.reply(text);
    }
    catch (error) {
        typing = false;
        clearInterval(typingInterval);
        console.error(error);
        await ctx.reply("Sorry, I encountered an error while processing your photo❌. Please try again.");
    }
});
function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs_1.default.readFileSync(path)).toString("base64"),
            mimeType
        },
    };
}
let typingInterval;
// normal messages
bot.on("message:text", async (ctx) => {
    if (["📚 About", "📞 Contact", "🌐 Languages"].includes(ctx.message.text)) {
        return;
    }
    if (!ctx.from) {
        await ctx.reply("Unable to retrieve user information.");
        return;
    }
    const userId = ctx.from.id;
    const messageText = ctx.message.text;
    try {
        await ctx.replyWithChatAction('typing');
        let typing = true;
        const typingInterval = setInterval(() => {
            if (typing)
                ctx.replyWithChatAction('typing');
        }, 5000);
        // Fetch the user's chat history from the database
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('chats')
            .eq('user_id', userId)
            .single();
        if (fetchError || !user) {
            console.error('Error fetching user chat history:', fetchError);
            await ctx.reply("Sorry, I encountered an error while retrieving your chat history.", { parse_mode: "MarkdownV2" });
            clearInterval(typingInterval);
            return;
        }
        const chatHistory = user.chats || [];
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(messageText);
        const response = await result.response;
        const response_text = escapeMarkdownV2(await response.text());
        // Update the user's chat history in the database with the new message and response
        const updatedChatHistory = [...chatHistory, { parts: messageText, role: 'user' }, { parts: response_text, role: 'model' }];
        await supabase
            .from('users')
            .update({ chats: updatedChatHistory })
            .eq('user_id', userId);
        typing = false;
        clearInterval(typingInterval);
        await ctx.reply(response_text, { parse_mode: "MarkdownV2" });
    }
    catch (error) {
        clearInterval(typingInterval);
        console.error('Error during chat handling:', error);
        await ctx.reply("Sorry, I encountered an error while processing your request❌. Please try again.", { parse_mode: "MarkdownV2" });
    }
});
function escapeMarkdownV2(text) {
    return text.replace(/[_*\[\]()~`>#+\-=|{}.!\\]/g, '\\$&').replace(/(\n)/g, '\\n');
}
exports.default = (0, grammy_1.webhookCallback)(bot, "http");
