import {EmbedBuilder} from 'discord.js'
import {staticIcons} from '../constants/staticIcons'
import {DepositDto} from '../types/dtos'
import {EtherScanTransactionLink, FN} from './common'

export function DepositTwitter(dto: DepositDto) {
    const post: string[] = []
    post.push(`$${FN(dto.value, 2)} deposit\n\n`)
    post.push(`${dto.toEns ? dto.toEns : dto.notableTo ? dto.to : '🧑 ' + dto.toAddress}\n`)
    post.push(`🔹 ${FN(dto.token0Amount, 2)} $${dto.token0Symbol} ($${FN(dto.token0Value, 2)})\n`)
    post.push(`🔸 ${FN(dto.token1Amount, 2)} $${dto.token1Symbol} ($${FN(dto.token1Value, 2)})\n\n`)
    if (!dto.isDeposit) {
        post.push(`from ${dto.fromEns ? dto.fromEns : dto.notableFrom ? dto.from : '🧑 ' + dto.fromAddress}\n`)
    }
    post.push(`🔗 ${EtherScanTransactionLink(dto.transactionHash)}\n\n`)
    post.push(`Trade and earn on Équilibre today 👇\n`)
    post.push(`https://equilibrefinance.com`)
    return post.join('')
}

export function DepositDiscord(dto: DepositDto): EmbedBuilder[] {
    const title = `$${FN(dto.value, 2)} ${dto.token0Symbol}/${dto.token1Symbol} Deposit`
    console.log(`[deposit] ${title}`)
    const messageEmbeds: EmbedBuilder[] = []
    const embed = new EmbedBuilder()
        .setColor('#00ff7f')
        .setURL(`${EtherScanTransactionLink(dto.transactionHash)}`)
        .setFooter({
            iconURL: staticIcons.velodromeIconSmall,
            text: `Équilibre`,
        })
        .setTimestamp()
        .setThumbnail('attachment://buffer.png')
        .setTitle(title)
        .addFields(
            {
                name: `$${dto.token0Symbol}`,
                value: `> 🔹 ${FN(dto.token0Amount, 2)} ($${FN(dto.token0Value, 2)})`,
                inline: false,
            },
            {
                name: `$${dto.token1Symbol}`,
                value: `> 🔸 ${FN(dto.token1Amount, 2)} ($${FN(dto.token1Value, 2)})`,
                inline: false,
            },
        )

    messageEmbeds.push(embed)
    return messageEmbeds
}
