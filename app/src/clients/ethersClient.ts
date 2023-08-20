import {ethers} from 'ethers'
import {RPC} from '../secrets'

export const mainNetInfuraProvider = new ethers.providers.JsonRpcProvider(
    {url: RPC, throttleLimit: 1},
    2222,
)
export const optimismInfuraProvider = new ethers.providers.JsonRpcProvider(
    {url: RPC, throttleLimit: 1},
    2222,
)
export const alchemyProvider = new ethers.providers.JsonRpcProvider(
    {url: RPC, throttleLimit: 1},
    2222,
)

export const optimsimProvider = new ethers.providers.JsonRpcProvider(
    {url: RPC, throttleLimit: 1},
    2222,
)
