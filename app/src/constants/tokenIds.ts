// [COINGECKO ID, SYMBOL, DECIMALS, CONGECKO-LOGO]
import axios from 'axios'
import {urls} from '../constants/urls'
import {TokensInfoData} from '../types/velo'

export const GetTokensData = async () => {
    const tokenData: TokensInfoData = (await axios.get(urls.tokenUrl)).data as TokensInfoData
    global.TOKEN_DATA = tokenData.tokens
    global.TOKENS = {}
    for (const i in global.TOKEN_DATA) {
        const token = global.TOKEN_DATA[i]
        const address = token.address.toLowerCase()
        global.TOKENS[address] =
            [
                token.symbol,
                token.symbol,
                token.decimals,
                token.logoURI
            ]
        // console.log(i, tokenName, token.symbol, token.decimals);
    }

    const symbols = GetSymbols()
    console.log(`[Info] Symbols: (${symbols.length}) ${symbols.join(', ')}`)
    return global.TOKENS;
}

export const GetSymbols = () => {
    const symbols: string[] = []
    for (const i in global.TOKEN_DATA) {
        const token = global.TOKEN_DATA[i]
        const symbol = token.symbol.toLowerCase()
        symbols.push(symbol)
    }
    return symbols;
}

export const GetTokens = () => {
    return global.TOKENS;
}
