# Equilibre Finance Discord Twitter Bot

The Equilibre Finance Discord Twitter Bot is a powerful tool that combines the functionalities of Discord and Twitter to provide real-time updates and notifications about the Equilibre Finance ecosystem. With this bot, you can stay informed about the latest news, announcements, and metrics related to Equilibre Finance, directly within your Discord server.

## Features

- **Twitter Integration:** Get real-time updates from the Equilibre Finance Twitter account directly in your Discord server.
- **Customizable Notifications:** Choose the specific types of tweets you want to receive notifications for, such as new announcements, important updates, or specific keywords.
- **Metrics Tracking:** Stay updated on key metrics like active users, new users, transactions, gas used, and median APY.
- **User Engagement:** Interact with other community members, discuss the latest updates, and engage in conversations related to Equilibre Finance.

## Installation

To add the Equilibre Finance Discord Twitter Bot to your Discord server, follow these steps:

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and create a new application.
2. Set up a bot for your application and copy the bot token.
3. Clone this repository to your local machine using the following command:
   ```
   git clone https://github.com/equilibre-finance/discord-twitter-bot.git
   ```
4. Create a `.env` file in the root directory of the project and add the following variables:
   ```
   BOT_TOKEN=<your-bot-token>
   TWITTER_API_KEY=<your-twitter-api-key>
   TWITTER_API_SECRET=<your-twitter-api-secret>
   TWITTER_ACCESS_TOKEN=<your-twitter-access-token>
   TWITTER_ACCESS_SECRET=<your-twitter-access-secret>
   ```
5. Install the necessary dependencies by running the following command:
   ```
   npm install
   ```
6. Start the bot with the following command:
   ```
   npm start
   ```
7. Authorize the bot to join your Discord server using the authorization URL provided in the console.

## Usage

Once the Equilibre Finance Discord Twitter Bot is added to your server, you can use the following commands:

- **!help:** Display a list of available commands and their usage.
- **!subscribe:** Subscribe to specific tweet notifications. You can choose to receive notifications for announcements, updates, or specific keywords.
- **!unsubscribe:** Unsubscribe from tweet notifications.
- **!metrics:** Get the latest metrics for Equilibre Finance, including active users, new users, transactions, gas used, and median APY.

## Contributing

Contributions to the Equilibre Finance Discord Twitter Bot are welcome and encouraged! If you find any bugs, have feature suggestions, or would like to contribute code, please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

