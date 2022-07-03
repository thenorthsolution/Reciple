[Reciple](../README.md) / [Exports](../modules.md) / RecipleClient

# Class: RecipleClient<Ready\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `Ready` | extends `boolean` = `boolean` |

## Hierarchy

- `Client`<`Ready`\>

  ↳ **`RecipleClient`**

## Table of contents

### Constructors

- [constructor](RecipleClient.md#constructor)

### Properties

- [application](RecipleClient.md#application)
- [channels](RecipleClient.md#channels)
- [commands](RecipleClient.md#commands)
- [config](RecipleClient.md#config)
- [emojis](RecipleClient.md#emojis)
- [guilds](RecipleClient.md#guilds)
- [logger](RecipleClient.md#logger)
- [modules](RecipleClient.md#modules)
- [options](RecipleClient.md#options)
- [otherApplicationCommandData](RecipleClient.md#otherapplicationcommanddata)
- [readyAt](RecipleClient.md#readyat)
- [readyTimestamp](RecipleClient.md#readytimestamp)
- [shard](RecipleClient.md#shard)
- [sweepers](RecipleClient.md#sweepers)
- [token](RecipleClient.md#token)
- [uptime](RecipleClient.md#uptime)
- [user](RecipleClient.md#user)
- [users](RecipleClient.md#users)
- [version](RecipleClient.md#version)
- [voice](RecipleClient.md#voice)
- [ws](RecipleClient.md#ws)
- [captureRejectionSymbol](RecipleClient.md#capturerejectionsymbol)
- [captureRejections](RecipleClient.md#capturerejections)
- [defaultMaxListeners](RecipleClient.md#defaultmaxlisteners)
- [errorMonitor](RecipleClient.md#errormonitor)

### Methods

- [\_commandExecuteError](RecipleClient.md#_commandexecuteerror)
- [addCommand](RecipleClient.md#addcommand)
- [addCommandListeners](RecipleClient.md#addcommandlisteners)
- [addListener](RecipleClient.md#addlistener)
- [addModule](RecipleClient.md#addmodule)
- [destroy](RecipleClient.md#destroy)
- [emit](RecipleClient.md#emit)
- [eventNames](RecipleClient.md#eventnames)
- [fetchGuildPreview](RecipleClient.md#fetchguildpreview)
- [fetchGuildTemplate](RecipleClient.md#fetchguildtemplate)
- [fetchGuildWidget](RecipleClient.md#fetchguildwidget)
- [fetchInvite](RecipleClient.md#fetchinvite)
- [fetchPremiumStickerPacks](RecipleClient.md#fetchpremiumstickerpacks)
- [fetchSticker](RecipleClient.md#fetchsticker)
- [fetchVoiceRegions](RecipleClient.md#fetchvoiceregions)
- [fetchWebhook](RecipleClient.md#fetchwebhook)
- [generateInvite](RecipleClient.md#generateinvite)
- [getMaxListeners](RecipleClient.md#getmaxlisteners)
- [getMessage](RecipleClient.md#getmessage)
- [interactionCommandExecute](RecipleClient.md#interactioncommandexecute)
- [isReady](RecipleClient.md#isready)
- [listenerCount](RecipleClient.md#listenercount)
- [listeners](RecipleClient.md#listeners)
- [loadModules](RecipleClient.md#loadmodules)
- [login](RecipleClient.md#login)
- [messageCommandExecute](RecipleClient.md#messagecommandexecute)
- [off](RecipleClient.md#off)
- [on](RecipleClient.md#on)
- [once](RecipleClient.md#once)
- [prependListener](RecipleClient.md#prependlistener)
- [prependOnceListener](RecipleClient.md#prependoncelistener)
- [rawListeners](RecipleClient.md#rawlisteners)
- [removeAllListeners](RecipleClient.md#removealllisteners)
- [removeListener](RecipleClient.md#removelistener)
- [setMaxListeners](RecipleClient.md#setmaxlisteners)
- [startModules](RecipleClient.md#startmodules)
- [sweepMessages](RecipleClient.md#sweepmessages)
- [toJSON](RecipleClient.md#tojson)
- [getEventListeners](RecipleClient.md#geteventlisteners)
- [listenerCount](RecipleClient.md#listenercount-1)
- [on](RecipleClient.md#on-1)
- [once](RecipleClient.md#once-1)
- [setMaxListeners](RecipleClient.md#setmaxlisteners-1)

## Constructors

### constructor

• **new RecipleClient**<`Ready`\>(`options`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Ready` | extends `boolean` = `boolean` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`RecipleClientOptions`](../interfaces/RecipleClientOptions.md) |

#### Inherited from

Client<Ready\>.constructor

## Properties

### application

• **application**: `If`<`Ready`, `ClientApplication`, ``null``\>

#### Inherited from

Client.application

#### Defined in

node_modules/discord.js/typings/index.d.ts:581

___

### channels

• **channels**: `ChannelManager`

#### Inherited from

Client.channels

#### Defined in

node_modules/discord.js/typings/index.d.ts:582

___

### commands

• **commands**: [`RecipleClientCommands`](../interfaces/RecipleClientCommands.md)

#### Defined in

[src/reciple/classes/RecipleClient.ts:74](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/RecipleClient.ts#L74)

___

### config

• **config**: [`Config`](../interfaces/Config.md)

#### Defined in

[src/reciple/classes/RecipleClient.ts:73](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/RecipleClient.ts#L73)

___

### emojis

• `Readonly` **emojis**: `BaseGuildEmojiManager`

#### Inherited from

Client.emojis

#### Defined in

node_modules/discord.js/typings/index.d.ts:583

___

### guilds

• **guilds**: `GuildManager`

#### Inherited from

Client.guilds

#### Defined in

node_modules/discord.js/typings/index.d.ts:584

___

### logger

• **logger**: `Logger`

#### Defined in

[src/reciple/classes/RecipleClient.ts:77](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/RecipleClient.ts#L77)

___

### modules

• **modules**: [`RecipleModule`](../interfaces/RecipleModule.md)[] = `[]`

#### Defined in

[src/reciple/classes/RecipleClient.ts:76](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/RecipleClient.ts#L76)

___

### options

• **options**: `ClientOptions`

#### Inherited from

Client.options

#### Defined in

node_modules/discord.js/typings/index.d.ts:585

___

### otherApplicationCommandData

• **otherApplicationCommandData**: ([`interactionCommandBuilders`](../modules.md#interactioncommandbuilders) \| `ApplicationCommandDataResolvable`)[] = `[]`

#### Defined in

[src/reciple/classes/RecipleClient.ts:75](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/RecipleClient.ts#L75)

___

### readyAt

• **readyAt**: `If`<`Ready`, [`Date`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date ), ``null``\>

#### Inherited from

Client.readyAt

#### Defined in

node_modules/discord.js/typings/index.d.ts:586

___

### readyTimestamp

• `Readonly` **readyTimestamp**: `If`<`Ready`, `number`, ``null``\>

#### Inherited from

Client.readyTimestamp

#### Defined in

node_modules/discord.js/typings/index.d.ts:587

___

### shard

• **shard**: ``null`` \| `ShardClientUtil`

#### Inherited from

Client.shard

#### Defined in

node_modules/discord.js/typings/index.d.ts:589

___

### sweepers

• **sweepers**: `Sweepers`

#### Inherited from

Client.sweepers

#### Defined in

node_modules/discord.js/typings/index.d.ts:588

___

### token

• **token**: `If`<`Ready`, `string`, ``null`` \| `string`\>

#### Inherited from

Client.token

#### Defined in

node_modules/discord.js/typings/index.d.ts:590

___

### uptime

• **uptime**: `If`<`Ready`, `number`, ``null``\>

#### Inherited from

Client.uptime

#### Defined in

node_modules/discord.js/typings/index.d.ts:591

___

### user

• **user**: `If`<`Ready`, `ClientUser`, ``null``\>

#### Inherited from

Client.user

#### Defined in

node_modules/discord.js/typings/index.d.ts:592

___

### users

• **users**: `UserManager`

#### Inherited from

Client.users

#### Defined in

node_modules/discord.js/typings/index.d.ts:593

___

### version

• **version**: `string` = `version`

#### Defined in

[src/reciple/classes/RecipleClient.ts:78](https://github.com/FalloutStudios/Reciple/blob/53bf2cd/src/reciple/classes/RecipleClient.ts#L78)

___

### voice

• **voice**: `ClientVoiceManager`

#### Inherited from

Client.voice

#### Defined in

node_modules/discord.js/typings/index.d.ts:594

___

### ws

• **ws**: `WebSocketManager`

#### Inherited from

Client.ws

#### Defined in

node_modules/discord.js/typings/index.d.ts:595

___

### captureRejectionSymbol

▪ `Static` `Readonly` **captureRejectionSymbol**: typeof [`captureRejectionSymbol`](RecipleClient.md#capturerejectionsymbol)

#### Defined in

node_modules/@types/node/events.d.ts:291

___

### captureRejections

▪ `Static` **captureRejections**: `boolean`

Sets or gets the default captureRejection value for all emitters.

#### Defined in

node_modules/@types/node/events.d.ts:296

___

### defaultMaxListeners

▪ `Static` **defaultMaxListeners**: `number`

#### Defined in

node_modules/@types/node/events.d.ts:297

___

### errorMonitor

▪ `Static` `Readonly` **errorMonitor**: typeof [`errorMonitor`](RecipleClient.md#errormonitor)

This symbol shall be used to install a listener for only monitoring `'error'`
events. Listeners installed using this symbol are called before the regular
`'error'` listeners are called.

Installing a listener using this symbol does not change the behavior once an
`'error'` event is emitted, therefore the process will still crash if no
regular `'error'` listener is installed.

#### Defined in

node_modules/@types/node/events.d.ts:290

## Methods

### \_commandExecuteError

▸ `Private` **_commandExecuteError**(`err`, `command`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `err` | [`Error`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error ) |
| `command` | [`recipleCommandBuildersExecute`](../modules.md#reciplecommandbuildersexecute) |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`void`\>

___

### addCommand

▸ **addCommand**(`command`): [`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `command` | [`recipleCommandBuilders`](../modules.md#reciplecommandbuilders) |

#### Returns

[`RecipleClient`](RecipleClient.md)<`Ready`\>

___

### addCommandListeners

▸ **addCommandListeners**(): [`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Returns

[`RecipleClient`](RecipleClient.md)<`Ready`\>

___

### addListener

▸ **addListener**(`eventName`, `listener`): [`RecipleClient`](RecipleClient.md)<`Ready`\>

Alias for `emitter.on(eventName, listener)`.

**`Since`**

 v0.1.26

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `string` \| `symbol` |
| `listener` | (...`args`: `any`[]) => `void` |

#### Returns

[`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Inherited from

Client.addListener

___

### addModule

▸ **addModule**(`script`, `registerCommands?`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`void`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `script` | [`RecipleScript`](RecipleScript.md) | `undefined` |
| `registerCommands` | `boolean` | `true` |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`void`\>

___

### destroy

▸ **destroy**(): `void`

#### Returns

`void`

#### Inherited from

Client.destroy

___

### emit

▸ **emit**<`E`\>(`event`, ...`args`): `boolean`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `E` | extends keyof [`RecipleClientEvents`](../interfaces/RecipleClientEvents.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `E` |
| `...args` | [`RecipleClientEvents`](../interfaces/RecipleClientEvents.md)[`E`] |

#### Returns

`boolean`

#### Overrides

Client.emit

▸ **emit**<`E`\>(`event`, ...`args`): `boolean`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `E` | extends `string` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Exclude`<`E`, keyof [`RecipleClientEvents`](../interfaces/RecipleClientEvents.md)\> |
| `...args` | `any` |

#### Returns

`boolean`

#### Overrides

Client.emit

___

### eventNames

▸ **eventNames**(): (`string` \| `symbol`)[]

Returns an array listing the events for which the emitter has registered
listeners. The values in the array are strings or `Symbol`s.

```js
const EventEmitter = require('events');
const myEE = new EventEmitter();
myEE.on('foo', () => {});
myEE.on('bar', () => {});

const sym = Symbol('symbol');
myEE.on(sym, () => {});

console.log(myEE.eventNames());
// Prints: [ 'foo', 'bar', Symbol(symbol) ]
```

**`Since`**

 v6.0.0

#### Returns

(`string` \| `symbol`)[]

#### Inherited from

Client.eventNames

___

### fetchGuildPreview

▸ **fetchGuildPreview**(`guild`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`GuildPreview`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `guild` | `GuildResolvable` |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`GuildPreview`\>

#### Inherited from

Client.fetchGuildPreview

___

### fetchGuildTemplate

▸ **fetchGuildTemplate**(`template`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`GuildTemplate`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `template` | `string` |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`GuildTemplate`\>

#### Inherited from

Client.fetchGuildTemplate

___

### fetchGuildWidget

▸ **fetchGuildWidget**(`guild`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`Widget`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `guild` | `GuildResolvable` |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`Widget`\>

#### Inherited from

Client.fetchGuildWidget

___

### fetchInvite

▸ **fetchInvite**(`invite`, `options?`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`Invite`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `invite` | `string` |
| `options?` | `ClientFetchInviteOptions` |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`Invite`\>

#### Inherited from

Client.fetchInvite

___

### fetchPremiumStickerPacks

▸ **fetchPremiumStickerPacks**(): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`Collection`<`string`, `StickerPack`\>\>

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`Collection`<`string`, `StickerPack`\>\>

#### Inherited from

Client.fetchPremiumStickerPacks

___

### fetchSticker

▸ **fetchSticker**(`id`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`Sticker`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`Sticker`\>

#### Inherited from

Client.fetchSticker

___

### fetchVoiceRegions

▸ **fetchVoiceRegions**(): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`Collection`<`string`, `VoiceRegion`\>\>

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`Collection`<`string`, `VoiceRegion`\>\>

#### Inherited from

Client.fetchVoiceRegions

___

### fetchWebhook

▸ **fetchWebhook**(`id`, `token?`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`Webhook`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `token?` | `string` |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`Webhook`\>

#### Inherited from

Client.fetchWebhook

___

### generateInvite

▸ **generateInvite**(`options?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `InviteGenerationOptions` |

#### Returns

`string`

#### Inherited from

Client.generateInvite

___

### getMaxListeners

▸ **getMaxListeners**(): `number`

Returns the current max listener value for the `EventEmitter` which is either
set by `emitter.setMaxListeners(n)` or defaults to [defaultMaxListeners](RecipleClient.md#defaultmaxlisteners).

**`Since`**

 v1.0.0

#### Returns

`number`

#### Inherited from

Client.getMaxListeners

___

### getMessage

▸ **getMessage**<`T`\>(`messageKey`, `defaultMessage?`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `messageKey` | `string` |
| `defaultMessage?` | `T` |

#### Returns

`T`

___

### interactionCommandExecute

▸ **interactionCommandExecute**(`interaction`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`void` \| [`RecipleInteractionCommandExecute`](../interfaces/RecipleInteractionCommandExecute.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `interaction` | `CommandInteraction`<`CacheType`\> \| `Interaction`<`CacheType`\> |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`void` \| [`RecipleInteractionCommandExecute`](../interfaces/RecipleInteractionCommandExecute.md)\>

___

### isReady

▸ **isReady**(): this is RecipleClient<true\>

#### Returns

this is RecipleClient<true\>

#### Overrides

Client.isReady

___

### listenerCount

▸ **listenerCount**(`eventName`): `number`

Returns the number of listeners listening to the event named `eventName`.

**`Since`**

 v3.2.0

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` \| `symbol` | The name of the event being listened for |

#### Returns

`number`

#### Inherited from

Client.listenerCount

___

### listeners

▸ **listeners**(`eventName`): [`Function`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function )[]

Returns a copy of the array of listeners for the event named `eventName`.

```js
server.on('connection', (stream) => {
  console.log('someone connected!');
});
console.log(util.inspect(server.listeners('connection')));
// Prints: [ [Function] ]
```

**`Since`**

 v0.1.26

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `string` \| `symbol` |

#### Returns

[`Function`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function )[]

#### Inherited from

Client.listeners

___

### loadModules

▸ **loadModules**(): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<[`RecipleClient`](RecipleClient.md)<`Ready`\>\>

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<[`RecipleClient`](RecipleClient.md)<`Ready`\>\>

___

### login

▸ **login**(`token?`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `token?` | `string` |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`string`\>

#### Inherited from

Client.login

___

### messageCommandExecute

▸ **messageCommandExecute**(`message`, `prefix?`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`void` \| [`RecipleMessageCommandExecute`](../interfaces/RecipleMessageCommandExecute.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `Message`<`boolean`\> |
| `prefix?` | `string` |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`void` \| [`RecipleMessageCommandExecute`](../interfaces/RecipleMessageCommandExecute.md)\>

___

### off

▸ **off**<`E`\>(`event`, `listener`): [`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `E` | extends keyof [`RecipleClientEvents`](../interfaces/RecipleClientEvents.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `E` |
| `listener` | (...`args`: [`RecipleClientEvents`](../interfaces/RecipleClientEvents.md)[`E`]) => `Awaitable`<`void`\> |

#### Returns

[`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Overrides

Client.off

▸ **off**<`E`\>(`event`, `listener`): [`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `E` | extends `string` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Exclude`<`E`, keyof [`RecipleClientEvents`](../interfaces/RecipleClientEvents.md)\> |
| `listener` | (...`args`: `any`) => `Awaitable`<`void`\> |

#### Returns

[`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Overrides

Client.off

___

### on

▸ **on**<`E`\>(`event`, `listener`): [`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `E` | extends keyof [`RecipleClientEvents`](../interfaces/RecipleClientEvents.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `E` |
| `listener` | (...`args`: [`RecipleClientEvents`](../interfaces/RecipleClientEvents.md)[`E`]) => `Awaitable`<`void`\> |

#### Returns

[`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Overrides

Client.on

▸ **on**<`E`\>(`event`, `listener`): [`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `E` | extends `string` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Exclude`<`E`, keyof [`RecipleClientEvents`](../interfaces/RecipleClientEvents.md)\> |
| `listener` | (...`args`: `any`) => `Awaitable`<`void`\> |

#### Returns

[`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Overrides

Client.on

___

### once

▸ **once**<`E`\>(`event`, `listener`): [`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `E` | extends keyof [`RecipleClientEvents`](../interfaces/RecipleClientEvents.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `E` |
| `listener` | (...`args`: [`RecipleClientEvents`](../interfaces/RecipleClientEvents.md)[`E`]) => `Awaitable`<`void`\> |

#### Returns

[`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Overrides

Client.once

▸ **once**<`E`\>(`event`, `listener`): [`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `E` | extends `number` \| `symbol` \| ``"toString"`` \| ``"charAt"`` \| ``"charCodeAt"`` \| ``"concat"`` \| ``"indexOf"`` \| ``"lastIndexOf"`` \| ``"localeCompare"`` \| ``"match"`` \| ``"replace"`` \| ``"search"`` \| ``"slice"`` \| ``"split"`` \| ``"substring"`` \| ``"toLowerCase"`` \| ``"toLocaleLowerCase"`` \| ``"toUpperCase"`` \| ``"toLocaleUpperCase"`` \| ``"trim"`` \| ``"length"`` \| ``"substr"`` \| ``"valueOf"`` \| ``"codePointAt"`` \| ``"includes"`` \| ``"endsWith"`` \| ``"normalize"`` \| ``"repeat"`` \| ``"startsWith"`` \| ``"anchor"`` \| ``"big"`` \| ``"blink"`` \| ``"bold"`` \| ``"fixed"`` \| ``"fontcolor"`` \| ``"fontsize"`` \| ``"italics"`` \| ``"link"`` \| ``"small"`` \| ``"strike"`` \| ``"sub"`` \| ``"sup"`` \| ``"padStart"`` \| ``"padEnd"`` \| ``"trimEnd"`` \| ``"trimStart"`` \| ``"trimLeft"`` \| ``"trimRight"`` \| ``"matchAll"`` \| ``"at"`` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Exclude`<`E`, keyof [`RecipleClientEvents`](../interfaces/RecipleClientEvents.md)\> |
| `listener` | (...`args`: `any`) => `Awaitable`<`void`\> |

#### Returns

[`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Overrides

Client.once

___

### prependListener

▸ **prependListener**(`eventName`, `listener`): [`RecipleClient`](RecipleClient.md)<`Ready`\>

Adds the `listener` function to the _beginning_ of the listeners array for the
event named `eventName`. No checks are made to see if the `listener` has
already been added. Multiple calls passing the same combination of `eventName`and `listener` will result in the `listener` being added, and called, multiple
times.

```js
server.prependListener('connection', (stream) => {
  console.log('someone connected!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

**`Since`**

 v6.0.0

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` \| `symbol` | The name of the event. |
| `listener` | (...`args`: `any`[]) => `void` | The callback function |

#### Returns

[`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Inherited from

Client.prependListener

___

### prependOnceListener

▸ **prependOnceListener**(`eventName`, `listener`): [`RecipleClient`](RecipleClient.md)<`Ready`\>

Adds a **one-time**`listener` function for the event named `eventName` to the_beginning_ of the listeners array. The next time `eventName` is triggered, this
listener is removed, and then invoked.

```js
server.prependOnceListener('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

**`Since`**

 v6.0.0

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` \| `symbol` | The name of the event. |
| `listener` | (...`args`: `any`[]) => `void` | The callback function |

#### Returns

[`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Inherited from

Client.prependOnceListener

___

### rawListeners

▸ **rawListeners**(`eventName`): [`Function`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function )[]

Returns a copy of the array of listeners for the event named `eventName`,
including any wrappers (such as those created by `.once()`).

```js
const emitter = new EventEmitter();
emitter.once('log', () => console.log('log once'));

// Returns a new Array with a function `onceWrapper` which has a property
// `listener` which contains the original listener bound above
const listeners = emitter.rawListeners('log');
const logFnWrapper = listeners[0];

// Logs "log once" to the console and does not unbind the `once` event
logFnWrapper.listener();

// Logs "log once" to the console and removes the listener
logFnWrapper();

emitter.on('log', () => console.log('log persistently'));
// Will return a new Array with a single function bound by `.on()` above
const newListeners = emitter.rawListeners('log');

// Logs "log persistently" twice
newListeners[0]();
emitter.emit('log');
```

**`Since`**

 v9.4.0

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `string` \| `symbol` |

#### Returns

[`Function`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function )[]

#### Inherited from

Client.rawListeners

___

### removeAllListeners

▸ **removeAllListeners**<`E`\>(`event?`): [`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `E` | extends keyof [`RecipleClientEvents`](../interfaces/RecipleClientEvents.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event?` | `E` |

#### Returns

[`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Overrides

Client.removeAllListeners

▸ **removeAllListeners**(`event?`): [`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `event?` | `string` \| `symbol` |

#### Returns

[`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Overrides

Client.removeAllListeners

___

### removeListener

▸ **removeListener**(`eventName`, `listener`): [`RecipleClient`](RecipleClient.md)<`Ready`\>

Removes the specified `listener` from the listener array for the event named`eventName`.

```js
const callback = (stream) => {
  console.log('someone connected!');
};
server.on('connection', callback);
// ...
server.removeListener('connection', callback);
```

`removeListener()` will remove, at most, one instance of a listener from the
listener array. If any single listener has been added multiple times to the
listener array for the specified `eventName`, then `removeListener()` must be
called multiple times to remove each instance.

Once an event is emitted, all listeners attached to it at the
time of emitting are called in order. This implies that any`removeListener()` or `removeAllListeners()` calls _after_ emitting and_before_ the last listener finishes execution will
not remove them from`emit()` in progress. Subsequent events behave as expected.

```js
const myEmitter = new MyEmitter();

const callbackA = () => {
  console.log('A');
  myEmitter.removeListener('event', callbackB);
};

const callbackB = () => {
  console.log('B');
};

myEmitter.on('event', callbackA);

myEmitter.on('event', callbackB);

// callbackA removes listener callbackB but it will still be called.
// Internal listener array at time of emit [callbackA, callbackB]
myEmitter.emit('event');
// Prints:
//   A
//   B

// callbackB is now removed.
// Internal listener array [callbackA]
myEmitter.emit('event');
// Prints:
//   A
```

Because listeners are managed using an internal array, calling this will
change the position indices of any listener registered _after_ the listener
being removed. This will not impact the order in which listeners are called,
but it means that any copies of the listener array as returned by
the `emitter.listeners()` method will need to be recreated.

When a single function has been added as a handler multiple times for a single
event (as in the example below), `removeListener()` will remove the most
recently added instance. In the example the `once('ping')`listener is removed:

```js
const ee = new EventEmitter();

function pong() {
  console.log('pong');
}

ee.on('ping', pong);
ee.once('ping', pong);
ee.removeListener('ping', pong);

ee.emit('ping');
ee.emit('ping');
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

**`Since`**

 v0.1.26

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `string` \| `symbol` |
| `listener` | (...`args`: `any`[]) => `void` |

#### Returns

[`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Inherited from

Client.removeListener

___

### setMaxListeners

▸ **setMaxListeners**(`n`): [`RecipleClient`](RecipleClient.md)<`Ready`\>

By default `EventEmitter`s will print a warning if more than `10` listeners are
added for a particular event. This is a useful default that helps finding
memory leaks. The `emitter.setMaxListeners()` method allows the limit to be
modified for this specific `EventEmitter` instance. The value can be set to`Infinity` (or `0`) to indicate an unlimited number of listeners.

Returns a reference to the `EventEmitter`, so that calls can be chained.

**`Since`**

 v0.3.5

#### Parameters

| Name | Type |
| :------ | :------ |
| `n` | `number` |

#### Returns

[`RecipleClient`](RecipleClient.md)<`Ready`\>

#### Inherited from

Client.setMaxListeners

___

### startModules

▸ **startModules**(): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<[`RecipleClient`](RecipleClient.md)<`Ready`\>\>

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<[`RecipleClient`](RecipleClient.md)<`Ready`\>\>

___

### sweepMessages

▸ **sweepMessages**(`lifetime?`): `number`

**`Deprecated`**

 Use Sweepers#sweepMessages instead

#### Parameters

| Name | Type |
| :------ | :------ |
| `lifetime?` | `number` |

#### Returns

`number`

#### Inherited from

Client.sweepMessages

___

### toJSON

▸ **toJSON**(): `unknown`

#### Returns

`unknown`

#### Inherited from

Client.toJSON

___

### getEventListeners

▸ `Static` **getEventListeners**(`emitter`, `name`): [`Function`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function )[]

Returns a copy of the array of listeners for the event named `eventName`.

For `EventEmitter`s this behaves exactly the same as calling `.listeners` on
the emitter.

For `EventTarget`s this is the only way to get the event listeners for the
event target. This is useful for debugging and diagnostic purposes.

```js
const { getEventListeners, EventEmitter } = require('events');

{
  const ee = new EventEmitter();
  const listener = () => console.log('Events are fun');
  ee.on('foo', listener);
  getEventListeners(ee, 'foo'); // [listener]
}
{
  const et = new EventTarget();
  const listener = () => console.log('Events are fun');
  et.addEventListener('foo', listener);
  getEventListeners(et, 'foo'); // [listener]
}
```

**`Since`**

 v15.2.0, v14.17.0

#### Parameters

| Name | Type |
| :------ | :------ |
| `emitter` | `EventEmitter` \| `DOMEventTarget` |
| `name` | `string` \| `symbol` |

#### Returns

[`Function`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function )[]

___

### listenerCount

▸ `Static` **listenerCount**(`emitter`, `eventName`): `number`

A class method that returns the number of listeners for the given `eventName`registered on the given `emitter`.

```js
const { EventEmitter, listenerCount } = require('events');
const myEmitter = new EventEmitter();
myEmitter.on('event', () => {});
myEmitter.on('event', () => {});
console.log(listenerCount(myEmitter, 'event'));
// Prints: 2
```

**`Since`**

 v0.9.12

**`Deprecated`**

 Since v3.2.0 - Use `listenerCount` instead.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `emitter` | `EventEmitter` | The emitter to query |
| `eventName` | `string` \| `symbol` | The event name |

#### Returns

`number`

#### Inherited from

Client.listenerCount

___

### on

▸ `Static` **on**(`emitter`, `eventName`, `options?`): `AsyncIterableIterator`<`any`\>

```js
const { on, EventEmitter } = require('events');

(async () => {
  const ee = new EventEmitter();

  // Emit later on
  process.nextTick(() => {
    ee.emit('foo', 'bar');
    ee.emit('foo', 42);
  });

  for await (const event of on(ee, 'foo')) {
    // The execution of this inner block is synchronous and it
    // processes one event at a time (even with await). Do not use
    // if concurrent execution is required.
    console.log(event); // prints ['bar'] [42]
  }
  // Unreachable here
})();
```

Returns an `AsyncIterator` that iterates `eventName` events. It will throw
if the `EventEmitter` emits `'error'`. It removes all listeners when
exiting the loop. The `value` returned by each iteration is an array
composed of the emitted event arguments.

An `AbortSignal` can be used to cancel waiting on events:

```js
const { on, EventEmitter } = require('events');
const ac = new AbortController();

(async () => {
  const ee = new EventEmitter();

  // Emit later on
  process.nextTick(() => {
    ee.emit('foo', 'bar');
    ee.emit('foo', 42);
  });

  for await (const event of on(ee, 'foo', { signal: ac.signal })) {
    // The execution of this inner block is synchronous and it
    // processes one event at a time (even with await). Do not use
    // if concurrent execution is required.
    console.log(event); // prints ['bar'] [42]
  }
  // Unreachable here
})();

process.nextTick(() => ac.abort());
```

**`Since`**

 v13.6.0, v12.16.0

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `emitter` | `EventEmitter` | - |
| `eventName` | `string` | The name of the event being listened for |
| `options?` | `StaticEventEmitterOptions` | - |

#### Returns

`AsyncIterableIterator`<`any`\>

that iterates `eventName` events emitted by the `emitter`

#### Inherited from

Client.on

___

### once

▸ `Static` **once**(`emitter`, `eventName`, `options?`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`any`[]\>

Creates a `Promise` that is fulfilled when the `EventEmitter` emits the given
event or that is rejected if the `EventEmitter` emits `'error'` while waiting.
The `Promise` will resolve with an array of all the arguments emitted to the
given event.

This method is intentionally generic and works with the web platform [EventTarget](https://dom.spec.whatwg.org/#interface-eventtarget) interface, which has no special`'error'` event
semantics and does not listen to the `'error'` event.

```js
const { once, EventEmitter } = require('events');

async function run() {
  const ee = new EventEmitter();

  process.nextTick(() => {
    ee.emit('myevent', 42);
  });

  const [value] = await once(ee, 'myevent');
  console.log(value);

  const err = new Error('kaboom');
  process.nextTick(() => {
    ee.emit('error', err);
  });

  try {
    await once(ee, 'myevent');
  } catch (err) {
    console.log('error happened', err);
  }
}

run();
```

The special handling of the `'error'` event is only used when `events.once()`is used to wait for another event. If `events.once()` is used to wait for the
'`error'` event itself, then it is treated as any other kind of event without
special handling:

```js
const { EventEmitter, once } = require('events');

const ee = new EventEmitter();

once(ee, 'error')
  .then(([err]) => console.log('ok', err.message))
  .catch((err) => console.log('error', err.message));

ee.emit('error', new Error('boom'));

// Prints: ok boom
```

An `AbortSignal` can be used to cancel waiting for the event:

```js
const { EventEmitter, once } = require('events');

const ee = new EventEmitter();
const ac = new AbortController();

async function foo(emitter, event, signal) {
  try {
    await once(emitter, event, { signal });
    console.log('event emitted!');
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Waiting for the event was canceled!');
    } else {
      console.error('There was an error', error.message);
    }
  }
}

foo(ee, 'foo', ac.signal);
ac.abort(); // Abort waiting for the event
ee.emit('foo'); // Prints: Waiting for the event was canceled!
```

**`Since`**

 v11.13.0, v10.16.0

#### Parameters

| Name | Type |
| :------ | :------ |
| `emitter` | `NodeEventTarget` |
| `eventName` | `string` \| `symbol` |
| `options?` | `StaticEventEmitterOptions` |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`any`[]\>

#### Inherited from

Client.once

▸ `Static` **once**(`emitter`, `eventName`, `options?`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`any`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `emitter` | `DOMEventTarget` |
| `eventName` | `string` |
| `options?` | `StaticEventEmitterOptions` |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`any`[]\>

#### Inherited from

Client.once

___

### setMaxListeners

▸ `Static` **setMaxListeners**(`n?`, ...`eventTargets`): `void`

```js
const {
  setMaxListeners,
  EventEmitter
} = require('events');

const target = new EventTarget();
const emitter = new EventEmitter();

setMaxListeners(5, target, emitter);
```

**`Since`**

 v15.4.0

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `n?` | `number` | A non-negative number. The maximum number of listeners per `EventTarget` event. |
| `...eventTargets` | (`EventEmitter` \| `DOMEventTarget`)[] | - |

#### Returns

`void`

#### Inherited from

Client.setMaxListeners
