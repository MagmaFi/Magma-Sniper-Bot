import {Telegraf} from 'telegraf'
import {PostTelegram} from './integrations/telegram'
import {DEV, LOG_CHANNEL, LOG_TOKEN, TELEGRAM_ENABLED} from './secrets'
import {Bot} from './bot'

let bot: Bot | null = null;
let maxRetries = 3; 

const telegram = new Telegraf(LOG_TOKEN)

async function initBot() {
    console.log('[Info] Initializing bot...');
    if (bot) {
        console.log('[Info] Cleaning up existing bot...');
        if(bot.alarm) {
            clearInterval(bot.alarm);
            bot.alarm = undefined;
        }
        bot = null;
    }
    bot = new Bot();
    await bot.init(DEV);
}


async function Initialize(retryCount = 0): Promise<void> {
    try {
        RegisterShutdownEvents()
        await initBot();
    } catch (error: any) {

        console.error('[Error]', error.toString())

        if (TELEGRAM_ENABLED)
            await PostTelegram(error.toString(), telegram, LOG_CHANNEL)

        if (retryCount < maxRetries) {

            if (TELEGRAM_ENABLED)
                await PostTelegram(`[Error] Retry attempt ${retryCount + 1}...`, telegram, LOG_CHANNEL)
                
            console.log(`[Error] Retry attempt ${retryCount + 1}...`)
            setTimeout(() => Initialize(retryCount + 1), 5000); 
        } else {

            if (TELEGRAM_ENABLED)
                await PostTelegram('[Error] Max retries exceeded. Bot shutting down.', telegram, LOG_CHANNEL)

            console.error('[Error] Max retries exceeded. Bot shutting down.')
        }
    }
}

function RegisterShutdownEvents(): void {
    process
        .on('unhandledRejection', async function (reason: any, p) {
            console.error('[Error] Unhandled Rejection at Promise', reason.toString());

            if(TELEGRAM_ENABLED)
                await PostTelegram(reason.toString(), telegram, LOG_CHANNEL)

            await new Promise(resolve => setTimeout(resolve, 10000));
            process.exit(1);

        })
        .on('uncaughtException', async function (err) {
            console.error(err, '[Error] Uncaught Exception thrown');

            if(TELEGRAM_ENABLED)
                await PostTelegram(err.toString(), telegram, LOG_CHANNEL)
        });
}

Initialize()
