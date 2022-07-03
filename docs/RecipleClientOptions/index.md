---
layout: default
title: "RecipleClientOptions"
has_children: true
has_toc: false
nav_order: 1
---

[Reciple](../README.md) / [Exports](../modules.md) / RecipleClientOptions

# Interface: RecipleClientOptions

## Hierarchy

- `ClientOptions`

  ↳ **`RecipleClientOptions`**

## Table of contents

### Properties

- [allowedMentions](index.md#allowedmentions)
- [closeTimeout](index.md#closetimeout)
- [config](index.md#config)
- [failIfNotExists](index.md#failifnotexists)
- [http](index.md#http)
- [intents](index.md#intents)
- [invalidRequestWarningInterval](index.md#invalidrequestwarninginterval)
- [makeCache](index.md#makecache)
- [messageCacheLifetime](index.md#messagecachelifetime)
- [messageSweepInterval](index.md#messagesweepinterval)
- [partials](index.md#partials)
- [presence](index.md#presence)
- [rejectOnRateLimit](index.md#rejectonratelimit)
- [restGlobalRateLimit](index.md#restglobalratelimit)
- [restRequestTimeout](index.md#restrequesttimeout)
- [restSweepInterval](index.md#restsweepinterval)
- [restTimeOffset](index.md#resttimeoffset)
- [restWsBridgeTimeout](index.md#restwsbridgetimeout)
- [retryLimit](index.md#retrylimit)
- [shardCount](index.md#shardcount)
- [shards](index.md#shards)
- [sweepers](index.md#sweepers)
- [userAgentSuffix](index.md#useragentsuffix)
- [waitGuildTimeout](index.md#waitguildtimeout)
- [ws](index.md#ws)

## Properties

### allowedMentions

• `Optional` **allowedMentions**: `MessageMentionOptions`

#### Inherited from

ClientOptions.allowedMentions

#### Defined in

node_modules/discord.js/typings/index.d.ts:4243

___

### closeTimeout

• `Optional` **closeTimeout**: `number`

#### Inherited from

ClientOptions.closeTimeout

#### Defined in

node_modules/discord.js/typings/index.d.ts:4237

___

### config

• **config**: [`Config`](../Config/index.md)

#### Defined in

[src/reciple/classes/RecipleClient.ts:40](https://github.com/FalloutStudios/Reciple/blob/668601a/src/reciple/classes/RecipleClient.ts#L40)

___

### failIfNotExists

• `Optional` **failIfNotExists**: `boolean`

#### Inherited from

ClientOptions.failIfNotExists

#### Defined in

node_modules/discord.js/typings/index.d.ts:4252

___

### http

• `Optional` **http**: `HTTPOptions`

#### Inherited from

ClientOptions.http

#### Defined in

node_modules/discord.js/typings/index.d.ts:4259

___

### intents

• **intents**: `BitFieldResolvable`<`IntentsString`, `number`\>

#### Inherited from

ClientOptions.intents

#### Defined in

node_modules/discord.js/typings/index.d.ts:4255

___

### invalidRequestWarningInterval

• `Optional` **invalidRequestWarningInterval**: `number`

#### Inherited from

ClientOptions.invalidRequestWarningInterval

#### Defined in

node_modules/discord.js/typings/index.d.ts:4244

___

### makeCache

• `Optional` **makeCache**: `CacheFactory`

#### Inherited from

ClientOptions.makeCache

#### Defined in

node_modules/discord.js/typings/index.d.ts:4238

___

### messageCacheLifetime

• `Optional` **messageCacheLifetime**: `number`

**`Deprecated`**

 Pass the value of this property as `lifetime` to `sweepers.messages` instead.

#### Inherited from

ClientOptions.messageCacheLifetime

#### Defined in

node_modules/discord.js/typings/index.d.ts:4240

___

### messageSweepInterval

• `Optional` **messageSweepInterval**: `number`

**`Deprecated`**

 Pass the value of this property as `interval` to `sweepers.messages` instead.

#### Inherited from

ClientOptions.messageSweepInterval

#### Defined in

node_modules/discord.js/typings/index.d.ts:4242

___

### partials

• `Optional` **partials**: `PartialTypes`[]

#### Inherited from

ClientOptions.partials

#### Defined in

node_modules/discord.js/typings/index.d.ts:4245

___

### presence

• `Optional` **presence**: `PresenceData`

#### Inherited from

ClientOptions.presence

#### Defined in

node_modules/discord.js/typings/index.d.ts:4254

___

### rejectOnRateLimit

• `Optional` **rejectOnRateLimit**: `string`[] \| (`data`: `RateLimitData`) => `boolean` \| [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`boolean`\>

#### Inherited from

ClientOptions.rejectOnRateLimit

#### Defined in

node_modules/discord.js/typings/index.d.ts:4260

___

### restGlobalRateLimit

• `Optional` **restGlobalRateLimit**: `number`

#### Inherited from

ClientOptions.restGlobalRateLimit

#### Defined in

node_modules/discord.js/typings/index.d.ts:4249

___

### restRequestTimeout

• `Optional` **restRequestTimeout**: `number`

#### Inherited from

ClientOptions.restRequestTimeout

#### Defined in

node_modules/discord.js/typings/index.d.ts:4248

___

### restSweepInterval

• `Optional` **restSweepInterval**: `number`

#### Inherited from

ClientOptions.restSweepInterval

#### Defined in

node_modules/discord.js/typings/index.d.ts:4250

___

### restTimeOffset

• `Optional` **restTimeOffset**: `number`

#### Inherited from

ClientOptions.restTimeOffset

#### Defined in

node_modules/discord.js/typings/index.d.ts:4247

___

### restWsBridgeTimeout

• `Optional` **restWsBridgeTimeout**: `number`

#### Inherited from

ClientOptions.restWsBridgeTimeout

#### Defined in

node_modules/discord.js/typings/index.d.ts:4246

___

### retryLimit

• `Optional` **retryLimit**: `number`

#### Inherited from

ClientOptions.retryLimit

#### Defined in

node_modules/discord.js/typings/index.d.ts:4251

___

### shardCount

• `Optional` **shardCount**: `number`

#### Inherited from

ClientOptions.shardCount

#### Defined in

node_modules/discord.js/typings/index.d.ts:4236

___

### shards

• `Optional` **shards**: `number` \| `number`[] \| ``"auto"``

#### Inherited from

ClientOptions.shards

#### Defined in

node_modules/discord.js/typings/index.d.ts:4235

___

### sweepers

• `Optional` **sweepers**: `SweeperOptions`

#### Inherited from

ClientOptions.sweepers

#### Defined in

node_modules/discord.js/typings/index.d.ts:4257

___

### userAgentSuffix

• `Optional` **userAgentSuffix**: `string`[]

#### Inherited from

ClientOptions.userAgentSuffix

#### Defined in

node_modules/discord.js/typings/index.d.ts:4253

___

### waitGuildTimeout

• `Optional` **waitGuildTimeout**: `number`

#### Inherited from

ClientOptions.waitGuildTimeout

#### Defined in

node_modules/discord.js/typings/index.d.ts:4256

___

### ws

• `Optional` **ws**: `WebSocketOptions`

#### Inherited from

ClientOptions.ws

#### Defined in

node_modules/discord.js/typings/index.d.ts:4258
