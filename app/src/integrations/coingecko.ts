import { CoinGeckoClient } from '../clients/coinGeckoClient'
import {GetSymbols} from '../constants/tokenIds'

export async function GetPrices(): Promise<void> {
  try {
    const cgIDs: string[] = GetSymbols();
    if( ! global.TOKEN_PRICES ){
      global.TOKEN_PRICES = {}
    }
    await CoinGeckoClient.simple.price({ ids: cgIDs, vs_currencies: 'usd' }).then((resp) => {
      // console.log(resp)
      cgIDs.map((token_id) => {
        try {
          if( ! resp.data[token_id] ){
            global.TOKEN_PRICES[token_id] = '0'
          }else {
            const tokenPrice = resp.data[token_id].usd
            // console.log(`${token_id} Token Price: ${tokenPrice}`)
            global.TOKEN_PRICES[token_id] = tokenPrice
          }
        } catch (e) {
          console.log(e)
        }
      })
    })
  } catch (ex) {
    console.log(ex)
  }
}
