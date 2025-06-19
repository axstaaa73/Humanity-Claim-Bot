import fs from "fs";
import fetch from "node-fetch";
import fetchCookie from "fetch-cookie";
import { HttpsProxyAgent } from "https-proxy-agent";
import { CookieJar } from "tough-cookie";
import chalk from "chalk";
import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
dotenv.config();

const BASE_URL = "https://testnet.humanity.org";
const PROXY_FILE = "proxy.txt";
const LOG_FILE = "log.txt";
const TOKEN = process.env.TOKEN;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const SLEEP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

const bot = new TelegramBot(TELEGRAM_TOKEN);

if (!TOKEN || TOKEN.length < 20) {
  console.error(chalk.red("❌ Your TOKEN is missing or invalid. Please check your .env file."));
  process.exit(1);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const PROXIES = fs.existsSync(PROXY_FILE)
  ? fs.readFileSync(PROXY_FILE, "utf-8").split("\n").map(p => p.trim()).filter(Boolean)
  : [];

function getRandomProxy() {
  if (PROXIES.length > 0) {
    const proxy = PROXIES[Math.floor(Math.random() * PROXIES.length)];
    return new HttpsProxyAgent(proxy);
  }
  return null;
}

function logError(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}

function sendTelegramMessage(text) {
  if (!TELEGRAM_TOKEN || !CHAT_ID) return;
  return bot.sendMessage(CHAT_ID, text, { parse_mode: "HTML" });
}

async function call(endpoint, token, agent, method = "POST", body = {}) {
  const jar = new CookieJar();
  const fetchWithCookies = fetchCookie(fetch, jar);

  const headers = {
    accept: "application/json, text/plain, */*",
    "content-type": "application/json",
    authorization: `Bearer ${token}`,
    token,
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
  };

  const res = await fetchWithCookies(BASE_URL + endpoint, {
    method,
    headers,
    agent,
    body: method === "GET" ? undefined : JSON.stringify(body)
  });

  let responseData;
  try {
    responseData = await res.json();
  } catch {
    throw new Error("Response is not valid JSON.");
  }

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${responseData.message}`);
  }

  return responseData;
}

async function runBot() {
  while (true) {
    const agent = getRandomProxy();
    const now = new Date().toLocaleString("en-US");

    console.log(chalk.gray(`\n🕒 ${now} | Checking for claim...`));

    try {
      const userInfo = await call("/api/user/userInfo", TOKEN, agent);
      const balance = await call("/api/rewards/balance", TOKEN, agent, "GET");
      const rewardStatus = await call("/api/rewards/daily/check", TOKEN, agent);

      console.log(`👤 User       : ${chalk.yellow(userInfo.data.nickName)}`);
      console.log(`🔗 Wallet     : ${chalk.yellow(userInfo.data.ethAddress)}`);
      console.log(`💰 HP Points  : ${chalk.green(balance.balance.total_rewards)}`);
      console.log(`📋 Claimable  : ${rewardStatus.available ? chalk.green("Yes") : chalk.red("No")}`);

      if (!rewardStatus.available) {
        console.log(chalk.blue("⏳ Already claimed today. Will retry in 24 hours."));
        await sleep(SLEEP_INTERVAL_MS);
        continue;
      }

      console.log(chalk.cyan("✨ Claiming your daily reward..."));

      const claim = await call("/api/rewards/daily/claim", TOKEN, agent);
      const claimedAmount = claim?.data?.amount || 0;

      const updated = await call("/api/rewards/balance", TOKEN, agent, "GET");
      const updatedBalance = updated.balance.total_rewards;

      console.log(chalk.green(`🎉 Claimed    : +${claimedAmount} HP Point`));
      console.log(`🏦 New Balance: ${chalk.green(updatedBalance)} HP Point`);

      // Send Telegram success message
      await sendTelegramMessage(
        `<b>🎉 Humanity Auto Claim Success</b>\n\n` +
        `👤 <b>User</b>     : ${userInfo.data.nickName}\n` +
        `🔗 <b>Wallet</b>   : <code>${userInfo.data.ethAddress}</code>\n` +
        `💰 <b>Claimed</b>  : +${claimedAmount} HP Point\n` +
        `🏦 <b>Balance</b>  : ${updatedBalance} HP\n\n` +
        `🕒 <b>Time</b>     : ${now}`
      );
    } catch (err) {
      const errorMsg = `🚨 Humanity Auto Claim Error\n\n❌ <b>Message</b>  : ${err.message}\n🕒 <b>Time</b>     : ${new Date().toLocaleString("en-US")}`;
      console.error(chalk.red("🚨 Error:"), err.message);
      logError(err.message);
      await sendTelegramMessage(errorMsg);
    }

    console.log(chalk.gray("🔁 Waiting 24 hours before next attempt...\n"));
    await sleep(SLEEP_INTERVAL_MS);
  }
}

runBot();
