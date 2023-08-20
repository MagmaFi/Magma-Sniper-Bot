import * as dotenv from 'dotenv'
import * as _ from 'lodash'
import { convertToBoolean } from '../utils/utils'

dotenv.config({ path: '.env' })

// LOCAL DEVELOPMENT MODE
export const DEV: boolean = _.defaultTo(convertToBoolean(process.env.DEV as string), false) as boolean

export const RPC = _.defaultTo(process.env.RPC, '')

export const LOG_TOKEN = _.defaultTo(process.env.LOG_TOKEN, '')
export const LOG_CHANNEL = _.defaultTo(process.env.LOG_CHANNEL, '')

// TWITTER
export const TWITTER_APP_KEY = _.defaultTo(process.env.TWITTER_APP_KEY, '')
export const TWITTER_APP_SECRET = _.defaultTo(process.env.TWITTER_APP_SECRET, '')
export const TWITTER_ACCESS_TOKEN = _.defaultTo(process.env.TWITTER_ACCESS_TOKEN, '')
export const TWITTER_ACCESS_SECRET = _.defaultTo(process.env.TWITTER_ACCESS_SECRET, '')

// DISCORD
export const DISCORD_ACCESS_TOKEN = _.defaultTo(process.env.DISCORD_ACCESS_TOKEN, '')
export const DISCORD_CHANNEL_SWAP = _.defaultTo(process.env.DISCORD_CHANNEL_SWAP, '')
export const DISCORD_CHANNEL_DEPOSIT = _.defaultTo(process.env.DISCORD_CHANNEL_DEPOSIT, '')
export const DISCORD_CHANNEL_BRIBE = _.defaultTo(process.env.DISCORD_CHANNEL_BRIBE, '')
export const DISCORD_CHANNEL_DEV = _.defaultTo(process.env.DISCORD_CHANNEL_DEV, '')

// TELEGRAM
export const TELEGRAM_ACCESS_TOKEN = _.defaultTo(process.env.TELEGRAM_ACCESS_TOKEN, '')
export const TELEGRAM_CHANNEL = _.defaultTo(process.env.TELEGRAM_CHANNEL, '')

// THRESHOLDS
export const DISCORD_SWAP_THRESHOLD = _.defaultTo(process.env.DISCORD_SWAP_THRESHOLD, 1) // 25000
export const DISCORD_DEPOSIT_THRESHOLD = _.defaultTo(process.env.DISCORD_DEPOSIT_THRESHOLD, 1) // 25000
export const DISCORD_BRIBE_THRESHOLD = _.defaultTo(process.env.DISCORD_BRIBE_THRESHOLD, 1) // 250

export const GLOBAL_DEPOSIT_THRESHOLD = _.defaultTo(process.env.GLOBAL_DEPOSIT_THRESHOLD, 1) // 25000
export const GLOBAL_SWAP_THRESHOLD = _.defaultTo(process.env.GLOBAL_SWAP_THRESHOLD, 1) // 25000
export const GLOBAL_BRIBE_THRESHOLD = _.defaultTo(process.env.GLOBAL_BRIBE_THRESHOLD, 1) // 250

// INTEGRATIONS
export const TWITTER_ENABLED: boolean = _.defaultTo(
  convertToBoolean(process.env.TWITTER_ENABLED as string),
  false,
) as boolean
export const TELEGRAM_ENABLED: boolean = _.defaultTo(
  convertToBoolean(process.env.TELEGRAM_ENABLED as string),
  true,
) as boolean
export const DISCORD_ENABLED: boolean = _.defaultTo(
  convertToBoolean(process.env.DISCORD_ENABLED as string),
  true,
) as boolean
