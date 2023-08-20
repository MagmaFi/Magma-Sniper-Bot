import { AttachmentBuilder, Client, EmbedBuilder } from 'discord.js'
import { Telegraf, Context } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'
import { TwitterApi } from 'twitter-api-v2'
import { EventType } from '../constants/eventType'
import { PostDiscord } from '../integrations/discord'
import { SendTweet } from '../integrations/twitter'
import {
  DEV,
  TWITTER_ENABLED,
  DISCORD_ENABLED,
  GLOBAL_SWAP_THRESHOLD,
  DISCORD_CHANNEL_SWAP,
  DISCORD_CHANNEL_DEPOSIT,
  DISCORD_CHANNEL_BRIBE,
  DISCORD_CHANNEL_DEV,
  GLOBAL_DEPOSIT_THRESHOLD,
  DISCORD_DEPOSIT_THRESHOLD,
  GLOBAL_BRIBE_THRESHOLD,
  DISCORD_BRIBE_THRESHOLD,
} from '../secrets'
import { BribeDiscord, BribeTwitter } from '../templates/bribe'
import { DepositDiscord, DepositTwitter } from '../templates/deposit'
import { SwapDiscord, SwapTwitter } from '../templates/swap'
import { BaseEvent, BribeDto, DepositDto, SwapDto } from '../types/dtos'
import printObject from '../utils/printObject'

export async function BroadCast<T extends BaseEvent>(
  dto: T,
  twitterClient: TwitterApi,
  telegramClient: Telegraf<Context<Update>>,
  discordClient: Client<boolean>,
): Promise<void> {
  if (TWITTER_ENABLED) {
    let post = ''
    if (dto.eventType == EventType.Swap) {
      if (dto.value >= Number(GLOBAL_SWAP_THRESHOLD)) {
        post = SwapTwitter(dto as unknown as SwapDto)
      }
    } else if (dto.eventType === EventType.Deposit) {
      if (dto.value >= Number(GLOBAL_DEPOSIT_THRESHOLD)) {
        post = DepositTwitter(dto as unknown as DepositDto)
      }
    } else if (dto.eventType === EventType.Bribe) {
      if (dto.value >= Number(GLOBAL_BRIBE_THRESHOLD)) {
        post = BribeTwitter(dto as unknown as BribeDto)
      }
    }

    if (DEV) {
      console.log('[dev twitter]', post)
    } else {
      if (post != '') {
        await SendTweet(post, twitterClient)
      }
    }
  }

  if (DISCORD_ENABLED) {
    let embed: EmbedBuilder[] = []
    const att: AttachmentBuilder[] = []

    //console.log('[dto.eventType]', dto.eventType)
    //console.log('[dto.value]', dto.value, 'Max:', GLOBAL_SWAP_THRESHOLD)


    if (dto.eventType == EventType.Swap) {
      if (dto.value >= Number(GLOBAL_SWAP_THRESHOLD)) {
        embed = SwapDiscord(dto as unknown as SwapDto)
        const buffer = Buffer.from((dto as unknown as SwapDto).img64, 'base64')
        att[0] = new AttachmentBuilder(buffer, { name: 'buffer.png' })
      }
    } else if (dto.eventType == EventType.Deposit) {
      if (dto.value >= Number(DISCORD_DEPOSIT_THRESHOLD)) {
        embed = DepositDiscord(dto as unknown as DepositDto)
        const buffer = Buffer.from((dto as unknown as DepositDto).img64, 'base64')
        att[0] = new AttachmentBuilder(buffer, { name: 'buffer.png' })
      }
    } else if (dto.eventType == EventType.Bribe) {
      if (dto.value >= Number(DISCORD_BRIBE_THRESHOLD)) {
        embed = BribeDiscord(dto as unknown as BribeDto)
        const buffer = Buffer.from((dto as unknown as BribeDto).img64, 'base64')
        att[0] = new AttachmentBuilder(buffer, { name: 'buffer.png' })
      }
    }

    if (embed.length > 0) {
      let channel = ''

      if (dto.eventType == EventType.Swap) {
        channel = DISCORD_CHANNEL_SWAP
      }

      if (dto.eventType == EventType.Deposit) {
        channel = DISCORD_CHANNEL_DEPOSIT
      }

      if (dto.eventType == EventType.Bribe) {
        channel = DISCORD_CHANNEL_BRIBE
      }

      if( DEV ){
        channel = DISCORD_CHANNEL_DEV;
        console.log('[dev discord]')
        printObject(embed)
      }

      await PostDiscord(embed, discordClient, channel, att)
    }
    

  }
}
