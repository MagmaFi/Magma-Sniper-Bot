import {Job, scheduleJob} from 'node-schedule'
import {GetPrices} from '../integrations/coingecko'
import {GetVeloData} from '../integrations/velo'
import {GetTokensData} from "../constants/tokenIds";

export function ScheduledJobs(): void {
    scheduleJob('*/20 * * * *', async () => {
        await GetTokensData()
        await GetPrices()
        await GetVeloData()
    })
}

// Monday / Wednesday / Friday (as this resets each build)
export const TriWeeklyJobs: Job = scheduleJob('0 0 * * 1,3,5', async () => {
    // do stuff
})
