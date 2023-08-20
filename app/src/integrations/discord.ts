import { Client, AttachmentBuilder, EmbedBuilder, TextChannel, ActivityType } from 'discord.js'

export async function PostDiscord(
  embeds: EmbedBuilder[],
  client: Client<boolean>,
  channelName: string,
  files: AttachmentBuilder[] | undefined,
) {
  try {
    
    const channels = client.channels.cache
      .filter((value) => (value as TextChannel)?.name == channelName)
      .map(async (channel) => {
        await (channel as TextChannel).send({ embeds: embeds, files: files })
      })
  } catch (e: any) {
    console.log('error channelName', channelName, e)
  }
}

export async function defaultActivity(client: Client<boolean>) {
  client.user?.setActivity(`Equilibre Pools`, { type: ActivityType.Watching })
}
