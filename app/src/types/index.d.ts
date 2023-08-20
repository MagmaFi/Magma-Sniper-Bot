/* eslint-disable no-var */

import {Pair, TokenInfo} from './velo'

declare global {
  var ENS: { [key: string]: string } = {}
  var PRICE: number
  var TOKEN_PRICES: { [key: string]: string } = {}
  var TOKEN_IMAGES: { [key: string]: string } = {}
  var VELO_DATA: Pair[]
  var TOKEN_DATA: TokenInfo[]
  var BRIBE_ADDRESSES: string[]
  var PAIR_ADDRESSES: string[]

  var TOKENS: { [key: string]: (string | number)[] } = {}

}

export {}
