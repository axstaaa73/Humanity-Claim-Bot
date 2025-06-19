# Humanity Auto Claim Bot

This bot automatically claims your daily HP (Humanity Points) from the [Humanity Protocol Testnet](https://testnet.humanity.org) and sends notifications to your Telegram.

## 📦 Features

- Automatically claims daily rewards from Humanity Protocol
- Sends success or error notifications via Telegram
- Proxy support (optional)
- Clean console logs with emoji + color
- Auto-repeats every 24 hours

## 🧰 Requirements

Before installing, make sure you have:

- Node.js v18.x or later
- npm
- Telegram Bot API token (from [@BotFather](https://t.me/BotFather))
- Your Telegram user ID
- Your Humanity account token

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/axstaaa73/Humanity-Claim-Bot.git
cd Humanity-Claim-Bot
```

2. Install dependencies:
```bash
npm install
```

## ⚙️ Configuration

1. Create or edit the `.env` file and add the following:
```
TOKEN=your_humanity_token
TELEGRAM_TOKEN=your_telegram_bot_token
CHAT_ID=your_telegram_chat_id
```

2. How to get your Humanity `TOKEN`:
- Go to https://testnet.humanity.org and log in with your wallet
- Press F12 (or right click → Inspect), go to the **Network** tab
- Reload the page
- Find a request to `/api/user/userInfo`, click on it
- In the **Headers** tab, find the `Authorization` field → copy the token after `Bearer `
- Paste it into your `.env` like this:
  ```
  TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

> 📌 **Note:** Humanity tokens expire after a period. You’ll need to refresh and update it manually.

3. (Optional) To use proxies, create a `proxy.txt` file with one proxy per line:
```
http://username:password@ip:port
```

## ▶️ Usage

To start the bot:
```bash
npm start
```

The bot will:
- Log into your Humanity account using your token
- Check if the daily reward is available
- Claim the reward if possible
- Send a notification via Telegram
- Wait 24 hours and repeat automatically

## 🛠️ Troubleshooting

- Make sure your `.env` file contains the correct tokens and chat ID
- Ensure you are using Node.js v18+ (`node -v`)
- If using a proxy, check its format and availability
- Look at `log.txt` for errors or failed requests

## 📄 License

This project is licensed under the [MIT](LICENSE) license.

---

If you have questions or suggestions, feel free to open an issue or pull request.  
Thanks for using Humanity Auto Claim Bot! 🙌


## 💖 Support & Donations

If you find this project helpful and would like to support its development, feel free to donate:

- EVM : `0x3525E1ae71cDbc4Ea203B60fF0Fc598Bc8CB7FF2`
- Solana: `F8GNZgMBoCDrxEYtVfFgMs2Kf3Xb7jRdEicjHvtTizie`

Your support is greatly appreciated and helps keep this project alive. Thank you! 🙏
