[Reciple](../README.md) / [Exports](../modules.md) / RecipleClientEvents

# Interface: RecipleClientEvents

## Hierarchy

- `ClientEvents`

  ↳ **`RecipleClientEvents`**

## Table of contents

### Properties

- [apiRequest](RecipleClientEvents.md#apirequest)
- [apiResponse](RecipleClientEvents.md#apiresponse)
- [applicationCommandCreate](RecipleClientEvents.md#applicationcommandcreate)
- [applicationCommandDelete](RecipleClientEvents.md#applicationcommanddelete)
- [applicationCommandUpdate](RecipleClientEvents.md#applicationcommandupdate)
- [cacheSweep](RecipleClientEvents.md#cachesweep)
- [channelCreate](RecipleClientEvents.md#channelcreate)
- [channelDelete](RecipleClientEvents.md#channeldelete)
- [channelPinsUpdate](RecipleClientEvents.md#channelpinsupdate)
- [channelUpdate](RecipleClientEvents.md#channelupdate)
- [debug](RecipleClientEvents.md#debug)
- [emojiCreate](RecipleClientEvents.md#emojicreate)
- [emojiDelete](RecipleClientEvents.md#emojidelete)
- [emojiUpdate](RecipleClientEvents.md#emojiupdate)
- [error](RecipleClientEvents.md#error)
- [guildBanAdd](RecipleClientEvents.md#guildbanadd)
- [guildBanRemove](RecipleClientEvents.md#guildbanremove)
- [guildCreate](RecipleClientEvents.md#guildcreate)
- [guildDelete](RecipleClientEvents.md#guilddelete)
- [guildIntegrationsUpdate](RecipleClientEvents.md#guildintegrationsupdate)
- [guildMemberAdd](RecipleClientEvents.md#guildmemberadd)
- [guildMemberAvailable](RecipleClientEvents.md#guildmemberavailable)
- [guildMemberRemove](RecipleClientEvents.md#guildmemberremove)
- [guildMemberUpdate](RecipleClientEvents.md#guildmemberupdate)
- [guildMembersChunk](RecipleClientEvents.md#guildmemberschunk)
- [guildScheduledEventCreate](RecipleClientEvents.md#guildscheduledeventcreate)
- [guildScheduledEventDelete](RecipleClientEvents.md#guildscheduledeventdelete)
- [guildScheduledEventUpdate](RecipleClientEvents.md#guildscheduledeventupdate)
- [guildScheduledEventUserAdd](RecipleClientEvents.md#guildscheduledeventuseradd)
- [guildScheduledEventUserRemove](RecipleClientEvents.md#guildscheduledeventuserremove)
- [guildUnavailable](RecipleClientEvents.md#guildunavailable)
- [guildUpdate](RecipleClientEvents.md#guildupdate)
- [interaction](RecipleClientEvents.md#interaction)
- [interactionCreate](RecipleClientEvents.md#interactioncreate)
- [invalidRequestWarning](RecipleClientEvents.md#invalidrequestwarning)
- [invalidated](RecipleClientEvents.md#invalidated)
- [inviteCreate](RecipleClientEvents.md#invitecreate)
- [inviteDelete](RecipleClientEvents.md#invitedelete)
- [message](RecipleClientEvents.md#message)
- [messageCreate](RecipleClientEvents.md#messagecreate)
- [messageDelete](RecipleClientEvents.md#messagedelete)
- [messageDeleteBulk](RecipleClientEvents.md#messagedeletebulk)
- [messageReactionAdd](RecipleClientEvents.md#messagereactionadd)
- [messageReactionRemove](RecipleClientEvents.md#messagereactionremove)
- [messageReactionRemoveAll](RecipleClientEvents.md#messagereactionremoveall)
- [messageReactionRemoveEmoji](RecipleClientEvents.md#messagereactionremoveemoji)
- [messageUpdate](RecipleClientEvents.md#messageupdate)
- [presenceUpdate](RecipleClientEvents.md#presenceupdate)
- [rateLimit](RecipleClientEvents.md#ratelimit)
- [ready](RecipleClientEvents.md#ready)
- [recipleInteractionCommandCreate](RecipleClientEvents.md#recipleinteractioncommandcreate)
- [recipleMessageCommandCreate](RecipleClientEvents.md#reciplemessagecommandcreate)
- [roleCreate](RecipleClientEvents.md#rolecreate)
- [roleDelete](RecipleClientEvents.md#roledelete)
- [roleUpdate](RecipleClientEvents.md#roleupdate)
- [shardDisconnect](RecipleClientEvents.md#sharddisconnect)
- [shardError](RecipleClientEvents.md#sharderror)
- [shardReady](RecipleClientEvents.md#shardready)
- [shardReconnecting](RecipleClientEvents.md#shardreconnecting)
- [shardResume](RecipleClientEvents.md#shardresume)
- [stageInstanceCreate](RecipleClientEvents.md#stageinstancecreate)
- [stageInstanceDelete](RecipleClientEvents.md#stageinstancedelete)
- [stageInstanceUpdate](RecipleClientEvents.md#stageinstanceupdate)
- [stickerCreate](RecipleClientEvents.md#stickercreate)
- [stickerDelete](RecipleClientEvents.md#stickerdelete)
- [stickerUpdate](RecipleClientEvents.md#stickerupdate)
- [threadCreate](RecipleClientEvents.md#threadcreate)
- [threadDelete](RecipleClientEvents.md#threaddelete)
- [threadListSync](RecipleClientEvents.md#threadlistsync)
- [threadMemberUpdate](RecipleClientEvents.md#threadmemberupdate)
- [threadMembersUpdate](RecipleClientEvents.md#threadmembersupdate)
- [threadUpdate](RecipleClientEvents.md#threadupdate)
- [typingStart](RecipleClientEvents.md#typingstart)
- [userUpdate](RecipleClientEvents.md#userupdate)
- [voiceStateUpdate](RecipleClientEvents.md#voicestateupdate)
- [warn](RecipleClientEvents.md#warn)
- [webhookUpdate](RecipleClientEvents.md#webhookupdate)

## Properties

### apiRequest

• **apiRequest**: [request: APIRequest]

#### Inherited from

ClientEvents.apiRequest

#### Defined in

node_modules/discord.js/typings/index.d.ts:4133

___

### apiResponse

• **apiResponse**: [request: APIRequest, response: Response]

#### Inherited from

ClientEvents.apiResponse

#### Defined in

node_modules/discord.js/typings/index.d.ts:4132

___

### applicationCommandCreate

• **applicationCommandCreate**: [command: ApplicationCommand<Object\>]

**`Deprecated`**

 See [this issue](https://github.com/discord/discord-api-docs/issues/3690) for more information.

#### Inherited from

ClientEvents.applicationCommandCreate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4141

___

### applicationCommandDelete

• **applicationCommandDelete**: [command: ApplicationCommand<Object\>]

**`Deprecated`**

 See [this issue](https://github.com/discord/discord-api-docs/issues/3690) for more information.

#### Inherited from

ClientEvents.applicationCommandDelete

#### Defined in

node_modules/discord.js/typings/index.d.ts:4143

___

### applicationCommandUpdate

• **applicationCommandUpdate**: [oldCommand: null \| ApplicationCommand<Object\>, newCommand: ApplicationCommand<Object\>]

**`Deprecated`**

 See [this issue](https://github.com/discord/discord-api-docs/issues/3690) for more information.

#### Inherited from

ClientEvents.applicationCommandUpdate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4145

___

### cacheSweep

• **cacheSweep**: [message: string]

#### Inherited from

ClientEvents.cacheSweep

#### Defined in

node_modules/discord.js/typings/index.d.ts:4146

___

### channelCreate

• **channelCreate**: [channel: NonThreadGuildBasedChannel]

#### Inherited from

ClientEvents.channelCreate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4147

___

### channelDelete

• **channelDelete**: [channel: DMChannel \| NonThreadGuildBasedChannel]

#### Inherited from

ClientEvents.channelDelete

#### Defined in

node_modules/discord.js/typings/index.d.ts:4148

___

### channelPinsUpdate

• **channelPinsUpdate**: [channel: TextBasedChannel, date: Date]

#### Inherited from

ClientEvents.channelPinsUpdate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4149

___

### channelUpdate

• **channelUpdate**: [oldChannel: DMChannel \| NonThreadGuildBasedChannel, newChannel: DMChannel \| NonThreadGuildBasedChannel]

#### Inherited from

ClientEvents.channelUpdate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4150

___

### debug

• **debug**: [message: string]

#### Inherited from

ClientEvents.debug

#### Defined in

node_modules/discord.js/typings/index.d.ts:4134

___

### emojiCreate

• **emojiCreate**: [emoji: GuildEmoji]

#### Inherited from

ClientEvents.emojiCreate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4155

___

### emojiDelete

• **emojiDelete**: [emoji: GuildEmoji]

#### Inherited from

ClientEvents.emojiDelete

#### Defined in

node_modules/discord.js/typings/index.d.ts:4156

___

### emojiUpdate

• **emojiUpdate**: [oldEmoji: GuildEmoji, newEmoji: GuildEmoji]

#### Inherited from

ClientEvents.emojiUpdate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4157

___

### error

• **error**: [error: Error]

#### Inherited from

ClientEvents.error

#### Defined in

node_modules/discord.js/typings/index.d.ts:4158

___

### guildBanAdd

• **guildBanAdd**: [ban: GuildBan]

#### Inherited from

ClientEvents.guildBanAdd

#### Defined in

node_modules/discord.js/typings/index.d.ts:4159

___

### guildBanRemove

• **guildBanRemove**: [ban: GuildBan]

#### Inherited from

ClientEvents.guildBanRemove

#### Defined in

node_modules/discord.js/typings/index.d.ts:4160

___

### guildCreate

• **guildCreate**: [guild: Guild]

#### Inherited from

ClientEvents.guildCreate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4161

___

### guildDelete

• **guildDelete**: [guild: Guild]

#### Inherited from

ClientEvents.guildDelete

#### Defined in

node_modules/discord.js/typings/index.d.ts:4162

___

### guildIntegrationsUpdate

• **guildIntegrationsUpdate**: [guild: Guild]

#### Inherited from

ClientEvents.guildIntegrationsUpdate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4164

___

### guildMemberAdd

• **guildMemberAdd**: [member: GuildMember]

#### Inherited from

ClientEvents.guildMemberAdd

#### Defined in

node_modules/discord.js/typings/index.d.ts:4165

___

### guildMemberAvailable

• **guildMemberAvailable**: [member: GuildMember \| PartialGuildMember]

#### Inherited from

ClientEvents.guildMemberAvailable

#### Defined in

node_modules/discord.js/typings/index.d.ts:4166

___

### guildMemberRemove

• **guildMemberRemove**: [member: GuildMember \| PartialGuildMember]

#### Inherited from

ClientEvents.guildMemberRemove

#### Defined in

node_modules/discord.js/typings/index.d.ts:4167

___

### guildMemberUpdate

• **guildMemberUpdate**: [oldMember: GuildMember \| PartialGuildMember, newMember: GuildMember]

#### Inherited from

ClientEvents.guildMemberUpdate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4173

___

### guildMembersChunk

• **guildMembersChunk**: [members: Collection<string, GuildMember\>, guild: Guild, data: Object]

#### Inherited from

ClientEvents.guildMembersChunk

#### Defined in

node_modules/discord.js/typings/index.d.ts:4168

___

### guildScheduledEventCreate

• **guildScheduledEventCreate**: [guildScheduledEvent: GuildScheduledEvent<"SCHEDULED" \| "ACTIVE" \| "COMPLETED" \| "CANCELED"\>]

#### Inherited from

ClientEvents.guildScheduledEventCreate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4223

___

### guildScheduledEventDelete

• **guildScheduledEventDelete**: [guildScheduledEvent: GuildScheduledEvent<"SCHEDULED" \| "ACTIVE" \| "COMPLETED" \| "CANCELED"\>]

#### Inherited from

ClientEvents.guildScheduledEventDelete

#### Defined in

node_modules/discord.js/typings/index.d.ts:4225

___

### guildScheduledEventUpdate

• **guildScheduledEventUpdate**: [oldGuildScheduledEvent: GuildScheduledEvent<"SCHEDULED" \| "ACTIVE" \| "COMPLETED" \| "CANCELED"\>, newGuildScheduledEvent: GuildScheduledEvent<"SCHEDULED" \| "ACTIVE" \| "COMPLETED" \| "CANCELED"\>]

#### Inherited from

ClientEvents.guildScheduledEventUpdate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4224

___

### guildScheduledEventUserAdd

• **guildScheduledEventUserAdd**: [guildScheduledEvent: GuildScheduledEvent<"SCHEDULED" \| "ACTIVE" \| "COMPLETED" \| "CANCELED"\>, user: User]

#### Inherited from

ClientEvents.guildScheduledEventUserAdd

#### Defined in

node_modules/discord.js/typings/index.d.ts:4226

___

### guildScheduledEventUserRemove

• **guildScheduledEventUserRemove**: [guildScheduledEvent: GuildScheduledEvent<"SCHEDULED" \| "ACTIVE" \| "COMPLETED" \| "CANCELED"\>, user: User]

#### Inherited from

ClientEvents.guildScheduledEventUserRemove

#### Defined in

node_modules/discord.js/typings/index.d.ts:4227

___

### guildUnavailable

• **guildUnavailable**: [guild: Guild]

#### Inherited from

ClientEvents.guildUnavailable

#### Defined in

node_modules/discord.js/typings/index.d.ts:4163

___

### guildUpdate

• **guildUpdate**: [oldGuild: Guild, newGuild: Guild]

#### Inherited from

ClientEvents.guildUpdate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4174

___

### interaction

• **interaction**: [interaction: Interaction<CacheType\>]

**`Deprecated`**

 Use interactionCreate instead

#### Inherited from

ClientEvents.interaction

#### Defined in

node_modules/discord.js/typings/index.d.ts:4210

___

### interactionCreate

• **interactionCreate**: [interaction: Interaction<CacheType\>]

#### Inherited from

ClientEvents.interactionCreate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4211

___

### invalidRequestWarning

• **invalidRequestWarning**: [invalidRequestWarningData: InvalidRequestWarningData]

#### Inherited from

ClientEvents.invalidRequestWarning

#### Defined in

node_modules/discord.js/typings/index.d.ts:4136

___

### invalidated

• **invalidated**: []

#### Inherited from

ClientEvents.invalidated

#### Defined in

node_modules/discord.js/typings/index.d.ts:4192

___

### inviteCreate

• **inviteCreate**: [invite: Invite]

#### Inherited from

ClientEvents.inviteCreate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4175

___

### inviteDelete

• **inviteDelete**: [invite: Invite]

#### Inherited from

ClientEvents.inviteDelete

#### Defined in

node_modules/discord.js/typings/index.d.ts:4176

___

### message

• **message**: [message: Message<boolean\>]

**`Deprecated`**

 Use messageCreate instead

#### Inherited from

ClientEvents.message

#### Defined in

node_modules/discord.js/typings/index.d.ts:4178

___

### messageCreate

• **messageCreate**: [message: Message<boolean\>]

#### Inherited from

ClientEvents.messageCreate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4179

___

### messageDelete

• **messageDelete**: [message: Message<boolean\> \| PartialMessage]

#### Inherited from

ClientEvents.messageDelete

#### Defined in

node_modules/discord.js/typings/index.d.ts:4180

___

### messageDeleteBulk

• **messageDeleteBulk**: [messages: Collection<string, Message<boolean\> \| PartialMessage\>]

#### Inherited from

ClientEvents.messageDeleteBulk

#### Defined in

node_modules/discord.js/typings/index.d.ts:4186

___

### messageReactionAdd

• **messageReactionAdd**: [reaction: MessageReaction \| PartialMessageReaction, user: User \| PartialUser]

#### Inherited from

ClientEvents.messageReactionAdd

#### Defined in

node_modules/discord.js/typings/index.d.ts:4187

___

### messageReactionRemove

• **messageReactionRemove**: [reaction: MessageReaction \| PartialMessageReaction, user: User \| PartialUser]

#### Inherited from

ClientEvents.messageReactionRemove

#### Defined in

node_modules/discord.js/typings/index.d.ts:4188

___

### messageReactionRemoveAll

• **messageReactionRemoveAll**: [message: Message<boolean\> \| PartialMessage, reactions: Collection<string, MessageReaction\>]

#### Inherited from

ClientEvents.messageReactionRemoveAll

#### Defined in

node_modules/discord.js/typings/index.d.ts:4181

___

### messageReactionRemoveEmoji

• **messageReactionRemoveEmoji**: [reaction: MessageReaction \| PartialMessageReaction]

#### Inherited from

ClientEvents.messageReactionRemoveEmoji

#### Defined in

node_modules/discord.js/typings/index.d.ts:4185

___

### messageUpdate

• **messageUpdate**: [oldMessage: Message<boolean\> \| PartialMessage, newMessage: Message<boolean\> \| PartialMessage]

#### Inherited from

ClientEvents.messageUpdate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4189

___

### presenceUpdate

• **presenceUpdate**: [oldPresence: null \| Presence, newPresence: Presence]

#### Inherited from

ClientEvents.presenceUpdate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4190

___

### rateLimit

• **rateLimit**: [rateLimitData: RateLimitData]

#### Inherited from

ClientEvents.rateLimit

#### Defined in

node_modules/discord.js/typings/index.d.ts:4135

___

### ready

• **ready**: [client: Client<true\>]

#### Inherited from

ClientEvents.ready

#### Defined in

node_modules/discord.js/typings/index.d.ts:4191

___

### recipleInteractionCommandCreate

• **recipleInteractionCommandCreate**: [command: RecipleInteractionCommandExecute]

#### Defined in

[src/reciple/classes/RecipleClient.ts:50](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/RecipleClient.ts#L50)

___

### recipleMessageCommandCreate

• **recipleMessageCommandCreate**: [command: RecipleMessageCommandExecute]

#### Defined in

[src/reciple/classes/RecipleClient.ts:49](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/RecipleClient.ts#L49)

___

### roleCreate

• **roleCreate**: [role: Role]

#### Inherited from

ClientEvents.roleCreate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4193

___

### roleDelete

• **roleDelete**: [role: Role]

#### Inherited from

ClientEvents.roleDelete

#### Defined in

node_modules/discord.js/typings/index.d.ts:4194

___

### roleUpdate

• **roleUpdate**: [oldRole: Role, newRole: Role]

#### Inherited from

ClientEvents.roleUpdate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4195

___

### shardDisconnect

• **shardDisconnect**: [closeEvent: CloseEvent, shardId: number]

#### Inherited from

ClientEvents.shardDisconnect

#### Defined in

node_modules/discord.js/typings/index.d.ts:4212

___

### shardError

• **shardError**: [error: Error, shardId: number]

#### Inherited from

ClientEvents.shardError

#### Defined in

node_modules/discord.js/typings/index.d.ts:4213

___

### shardReady

• **shardReady**: [shardId: number, unavailableGuilds: Set<string\>]

#### Inherited from

ClientEvents.shardReady

#### Defined in

node_modules/discord.js/typings/index.d.ts:4214

___

### shardReconnecting

• **shardReconnecting**: [shardId: number]

#### Inherited from

ClientEvents.shardReconnecting

#### Defined in

node_modules/discord.js/typings/index.d.ts:4215

___

### shardResume

• **shardResume**: [shardId: number, replayedEvents: number]

#### Inherited from

ClientEvents.shardResume

#### Defined in

node_modules/discord.js/typings/index.d.ts:4216

___

### stageInstanceCreate

• **stageInstanceCreate**: [stageInstance: StageInstance]

#### Inherited from

ClientEvents.stageInstanceCreate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4217

___

### stageInstanceDelete

• **stageInstanceDelete**: [stageInstance: StageInstance]

#### Inherited from

ClientEvents.stageInstanceDelete

#### Defined in

node_modules/discord.js/typings/index.d.ts:4219

___

### stageInstanceUpdate

• **stageInstanceUpdate**: [oldStageInstance: null \| StageInstance, newStageInstance: StageInstance]

#### Inherited from

ClientEvents.stageInstanceUpdate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4218

___

### stickerCreate

• **stickerCreate**: [sticker: Sticker]

#### Inherited from

ClientEvents.stickerCreate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4220

___

### stickerDelete

• **stickerDelete**: [sticker: Sticker]

#### Inherited from

ClientEvents.stickerDelete

#### Defined in

node_modules/discord.js/typings/index.d.ts:4221

___

### stickerUpdate

• **stickerUpdate**: [oldSticker: Sticker, newSticker: Sticker]

#### Inherited from

ClientEvents.stickerUpdate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4222

___

### threadCreate

• **threadCreate**: [thread: ThreadChannel, newlyCreated: boolean]

#### Inherited from

ClientEvents.threadCreate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4196

___

### threadDelete

• **threadDelete**: [thread: ThreadChannel]

#### Inherited from

ClientEvents.threadDelete

#### Defined in

node_modules/discord.js/typings/index.d.ts:4197

___

### threadListSync

• **threadListSync**: [threads: Collection<string, ThreadChannel\>]

#### Inherited from

ClientEvents.threadListSync

#### Defined in

node_modules/discord.js/typings/index.d.ts:4198

___

### threadMemberUpdate

• **threadMemberUpdate**: [oldMember: ThreadMember, newMember: ThreadMember]

#### Inherited from

ClientEvents.threadMemberUpdate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4199

___

### threadMembersUpdate

• **threadMembersUpdate**: [oldMembers: Collection<string, ThreadMember\>, newMembers: Collection<string, ThreadMember\>]

#### Inherited from

ClientEvents.threadMembersUpdate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4200

___

### threadUpdate

• **threadUpdate**: [oldThread: ThreadChannel, newThread: ThreadChannel]

#### Inherited from

ClientEvents.threadUpdate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4204

___

### typingStart

• **typingStart**: [typing: Typing]

#### Inherited from

ClientEvents.typingStart

#### Defined in

node_modules/discord.js/typings/index.d.ts:4205

___

### userUpdate

• **userUpdate**: [oldUser: User \| PartialUser, newUser: User]

#### Inherited from

ClientEvents.userUpdate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4206

___

### voiceStateUpdate

• **voiceStateUpdate**: [oldState: VoiceState, newState: VoiceState]

#### Inherited from

ClientEvents.voiceStateUpdate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4207

___

### warn

• **warn**: [message: string]

#### Inherited from

ClientEvents.warn

#### Defined in

node_modules/discord.js/typings/index.d.ts:4154

___

### webhookUpdate

• **webhookUpdate**: [channel: NewsChannel \| TextChannel \| VoiceChannel]

#### Inherited from

ClientEvents.webhookUpdate

#### Defined in

node_modules/discord.js/typings/index.d.ts:4208
