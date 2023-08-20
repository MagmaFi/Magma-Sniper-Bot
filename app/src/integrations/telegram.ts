import {TELEGRAM_CHANNEL, DEV} from '../secrets'
import {Context, Telegraf} from 'telegraf'
import {Update} from 'telegraf/typings/core/types/typegram'

export async function PostTelegram(
    post: string,
    telegramClient: Telegraf<Context<Update>>,
    channel: string = TELEGRAM_CHANNEL,
) {
    try {
        await telegramClient.telegram.sendMessage(channel, post, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
        })
        // console.log(response);
    } catch (e: any) {
        console.log(e)
    }

}
