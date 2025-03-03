// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { ChatsService } from './chats.class'

// Main data model schema
export const chatsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    text: Type.String()
  },
  { $id: 'Chats', additionalProperties: false }
)
export type Chats = Static<typeof chatsSchema>
export const chatsValidator = getValidator(chatsSchema, dataValidator)
export const chatsResolver = resolve<Chats, HookContext<ChatsService>>({})

export const chatsExternalResolver = resolve<Chats, HookContext<ChatsService>>({})

// Schema for creating new entries
export const chatsDataSchema = Type.Pick(chatsSchema, ['text'], {
  $id: 'ChatsData'
})
export type ChatsData = Static<typeof chatsDataSchema>
export const chatsDataValidator = getValidator(chatsDataSchema, dataValidator)
export const chatsDataResolver = resolve<Chats, HookContext<ChatsService>>({})

// Schema for updating existing entries
export const chatsPatchSchema = Type.Partial(chatsSchema, {
  $id: 'ChatsPatch'
})
export type ChatsPatch = Static<typeof chatsPatchSchema>
export const chatsPatchValidator = getValidator(chatsPatchSchema, dataValidator)
export const chatsPatchResolver = resolve<Chats, HookContext<ChatsService>>({})

// Schema for allowed query properties
export const chatsQueryProperties = Type.Pick(chatsSchema, ['_id', 'text'])
export const chatsQuerySchema = Type.Intersect(
  [
    querySyntax(chatsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type ChatsQuery = Static<typeof chatsQuerySchema>
export const chatsQueryValidator = getValidator(chatsQuerySchema, queryValidator)
export const chatsQueryResolver = resolve<ChatsQuery, HookContext<ChatsService>>({})
