import {DISCORD_SWAP_THRESHOLD, TELEGRAM_CHANNEL, TELEGRAM_ENABLED} from '../secrets'
import fromBigNumber from '../utils/fromBigNumber'
import { Client } from 'discord.js'
import { SwapDto } from '../types/dtos'
import { GetNotableAddress } from '../utils/notableAddresses'
import { firstAddress, toDate } from '../utils/utils'
import RpcClient from '../clients/client'
import { Context, Telegraf } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'
import { TwitterApi } from 'twitter-api-v2'
import { Event as GenericEvent } from 'ethers'
import { SwapEvent } from '../contracts/typechain/VelodromePair'
import { VelodromePair__factory } from '../contracts/typechain'

import { getMergedThumbnail } from '../utils/mergedImage'
import { EventType } from '../constants/eventType'
import { BroadCast } from './common'
import { Pair } from '../types/velo'
import { PriceToken } from './pricing'
import {GetTokens} from "../constants/tokenIds";

export async function TrackSwap(
  discordClient: Client<boolean>,
  telegramClient: Telegraf<Context<Update>>,
  twitterClient: TwitterApi,
  rpcClient: RpcClient,
  genericEvent: GenericEvent,
): Promise<void> {

  const TOKENS = GetTokens()
  const event = parseEvent(genericEvent as SwapEvent)

  try {
    let timestamp = 0

    const pairs: Pair[] = []

    VELO_DATA.map((pair) => {      

      if (pair.address?.toLowerCase() === event.address.toLowerCase()) {
        pairs.push(pair)
      }
    })

    if (pairs.length == 0) {
      
      const post = '[swap] PAIR not found in API. Address: '.concat(event.address.toLowerCase());
      console.log(post)

      if(TELEGRAM_ENABLED)
        await telegramClient.telegram.sendMessage(TELEGRAM_CHANNEL, post)
      return
    }

    const pair = pairs[0]

    const token0 = TOKENS[pair?.token0_address.toLowerCase() as string]
    const token1 = TOKENS[pair?.token1_address.toLowerCase() as string]

    if (token0 === undefined || token1 === undefined) {
      let post = ``;
      if( token0 === undefined )
        post += `[swap] Token 0 not found: ${pair?.token0_address}\n`
      if( token1 === undefined )
        post += `[swap] Token 1 not found: ${pair?.token1_address}\n`
      console.log(post)

      await telegramClient.telegram.sendMessage(TELEGRAM_CHANNEL, post)

      return
    }

    const amount0In = fromBigNumber(event.args.amount0In, token0[2] as number)
    const amount1In = fromBigNumber(event.args.amount1In, token1[2] as number)
    const amount0Out = fromBigNumber(event.args.amount0Out, token0[2] as number)
    const amount1Out = fromBigNumber(event.args.amount1Out, token1[2] as number)
    const token0Price = await PriceToken(token0, pair?.token0_address.toLowerCase() as string)
    const token1Price = await PriceToken(token1, pair?.token1_address.toLowerCase() as string)
    const amount0InValue = amount0In * (token0Price as unknown as number)
    const amount1InValue = amount1In * (token1Price as unknown as number)
    const amount0OutValue = amount0Out * (token0Price as unknown as number)
    const amount1OutValue = amount1Out * (token1Price as unknown as number)
    const totalValue = amount0In > 0 ? amount0InValue : amount1InValue

    if (totalValue >= Number(DISCORD_SWAP_THRESHOLD)) {
      console.log(`Swap found: $${totalValue}`)
      try {
        timestamp = (await rpcClient.provider.getBlock(event.blockNumber)).timestamp
      } catch (ex) {
        console.log(ex)
      }
      const from = GetNotableAddress(event.args.sender)
      const to = GetNotableAddress(event.address)
      const img64 = (await getMergedThumbnail(token0, token1)) ?? ''

      const dto: SwapDto = {
        eventType: EventType.Swap,
        from: from === '' ? firstAddress(event.args.sender) : event.args.sender,
        to: to === '' ? firstAddress(event.address) : to,
        amount0In: amount0In,
        amount0InValue: amount0InValue,
        amount1In: amount1In,
        amount1InValue: amount1InValue,
        amount0Out: amount0Out,
        amount0OutValue: amount0OutValue,
        amount1Out: amount1Out,
        amount1OutValue: amount1OutValue,
        transactionHash: event.transactionHash,
        fromEns: '',
        toEns: '',
        timestamp: timestamp === 0 ? toDate(Date.now()) : toDate(timestamp),
        blockNumber: event.blockNumber,
        notableTo: to !== '',
        notableFrom: from !== '',
        fromAddress: event.args.sender,
        toAddress: event.address,
        token0Symbol: token0[1] as string,
        token1Symbol: token1[1] as string,
        imageUrl: '',
        img64: img64,
        value: totalValue,
      }

      await BroadCast(dto, twitterClient, telegramClient, discordClient)
    } else {
      //console.log(`Swap found: $${totalValue}, smaller than ${DISCORD_SWAP_THRESHOLD} threshold.`)
    }
  } catch (e) {
    console.log(e)
  }
}

export function parseEvent(event: SwapEvent): SwapEvent {
  const parsedEvent = VelodromePair__factory.createInterface().parseLog(event)
  if ((parsedEvent.args as SwapEvent['args']).length > 0) {
    event.args = parsedEvent.args as SwapEvent['args']
  }
  return event
}
