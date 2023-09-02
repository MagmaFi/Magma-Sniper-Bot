
# MagmaFI Bot: Simplified Trading on Telegram

MagmaFI Bot is your streamlined trading assistant designed for the easy and convenient management of trading activities on our decentralized exchange, MagmaFI. Whether you're a novice or an experienced trader, our bot simplifies the trading process and brings powerful features right to your Telegram.


## Features at Your Fingertips

Our bot operates in two distinct modes:

    Normal Tracking Mode: In this mode, our bot diligently monitors blockchain events without engaging in any front-running activities. It keeps an eye on various actions such as bribes, deposits, transfers, withdrawals, and more. This valuable information allows us to provide timely notifications to our users on platforms like Telegram, Discord, and Twitter.

    Bid Tracking Mode: This mode involves proactive tracking of new coins and tokens. Our bot is equipped to execute buy and sell orders for tokens, ensuring a swift response to any unusual developer activity. It acts as an anti-rug mechanism, a manual buyer, and even an auto snipe tool, ensuring the security of your investments and timely alerts for important events.

- **Effortless Registration**: Seamlessly register to unlock the full potential of the trading features.
- **Auto Sniping**: Automatically snatch your desired assets the moment they're available.
- **Manual Buying**: Execute manual buy transactions with customizable gas prices.
- **Settings Made Easy**: Customize your trading preferences using an intuitive settings menu.
- **Wallet Management**: Add, delete, and manage your trading wallets with minimal hassle.
- **Anti-Rug Protection**: Toggle on anti-rug settings for added security against risks.
- **Blacklist Control**: Manage asset transfers using our blacklist feature.
- **Personalized Alerts**: Receive tailored alerts for critical trading events.
- **Twitter Integration:** Get real-time updates from the MagmaFI Twitter account directly in your Discord server.
- **Customizable Notifications:** Choose the specific types of tweets you want to receive notifications for, such as new announcements, important updates, or specific keywords.
- **Metrics Tracking:** Stay updated on key metrics like active users, new users, transactions, gas used, and median APY.
- **User Engagement:** Interact with other community members, discuss the latest updates, and engage in conversations related to MagmaFI Finance.

### Ready to Dive In?

Check out our [comprehensive documentation](magmafi.xyz) to explore all the features and fine-tune your trading experience.


## Configure service

### Prerequisites

- Node.js and npm installed.
- A Telegram bot token.
- Basic knowledge of trading strategies and Ethereum wallets.

### Installation

1. Clone this repository:

```bash
git clone https://github.com/MagmaFi/telegram-trader-bot.git
cd telegram-trader-bot
```

2. Install the dependencies:

```bash
npm install
```

3. Start the bot locally:

```bash
npm start
```

### Environment Variables

Configure the following environment variables for integrations:

#### Discord

- `DISCORD_ENABLED`: Enable/disable posting to Discord.
- `DISCORD_ACCESS_TOKEN`
- `DISCORD_CHANNEL_SWAP`: Channel for posting swaps (e.g., 🔁-swaps).
- `DISCORD_CHANNEL_DEPOSIT`: Channel for posting deposits (e.g., 📩-deposits).
- `DISCORD_CHANNEL_BRIBE`: Channel for posting bribes (e.g., 💰-bribes).

#### Twitter

- `TWITTER_ENABLED`
- `TWITTER_APP_KEY`
- `TWITTER_APP_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_SECRET`

#### Telegram Logging

Log bot launch and status changes:

- `LOG_TOKEN`
- `LOG_CHANNEL`


## Contribute and Connect

We welcome your contributions! If you encounter any issues or have suggestions for enhancements, please feel free to open an issue or submit a pull request.

