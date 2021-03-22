import { Plugin } from '@vizality/entities'
import { getModule, FluxDispatcher } from '@vizality/webpack'

const { getUser, getCurrentUser } = getModule('getCurrentUser')
const { getMessage } = getModule('getMessage', 'getMessages')
const { getChannel } = getModule('getChannel')
const { transitionTo } = getModule('transitionTo')
const { getGuild } = getModule('getGuild')
const { getStatus } = getModule('getStatus')

let _reaction
export default class ReactionNotifications extends Plugin {
  start() { FluxDispatcher.subscribe('MESSAGE_REACTION_ADD', this.onReaction) }
  stop() { FluxDispatcher.unsubscribe('MESSAGE_REACTION_ADD', this.onReaction) }

  onReaction(reaction) {
    if (reaction?.messageId) {
      const MESSAGE = getMessage(reaction.channelId, reaction.messageId)
      const CURRENT_USER = getCurrentUser().id
      if (MESSAGE?.author.id === CURRENT_USER) {
        // Duplicate Handling
        _reaction = _reaction ? null : reaction
        if (!_reaction) return

        const USER = getUser(reaction.userId)
        const CHANNEL = getChannel(reaction.channelId)
        const GUILD = getGuild(CHANNEL.guild_id)
        
        if (getStatus(CURRENT_USER) !== 'dnd') 
          new Notification(`${USER.username}${GUILD ? ` (#${CHANNEL.name}, ${GUILD.name})` : ''}`, {
            icon: USER.getAvatarURL(),
            body: `New Reaction: ${reaction.emoji.name}`,
            silent: true
          }).addEventListener('click', () => transitionTo(`/channels/${GUILD ? GUILD.id : '@me'}/${CHANNEL.id}/${MESSAGE.id}`)),
          new Audio('https://discord.com/assets/dd920c06a01e5bb8b09678581e29d56f.mp3').play()
        // i'll add xenolib support when it actually works in vz :)
      }
    }
  }
}