// src/services/chats/chats.schema.ts - Updated schema
import { resolve } from '@feathersjs/schema';
import { Type, getValidator, querySyntax } from '@feathersjs/typebox';
import { ObjectIdSchema } from '@feathersjs/typebox';
import type { Static } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';
import type { ChatsService } from './chats.class';

// Main data model schema
export const chatsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    title: Type.String(),
    user_id: Type.String(),
    model: Type.Optional(Type.String()),
    created_at: Type.Optional(Type.String({ format: 'date-time' })),
    updated_at: Type.Optional(Type.String({ format: 'date-time' }))
  },
  { $id: 'Chats', additionalProperties: false }
);

export type Chats = Static<typeof chatsSchema>;
export const chatsValidator = getValidator(chatsSchema, dataValidator);
export const chatsResolver = resolve<Chats, HookContext<ChatsService>>({
  created_at: async () => new Date().toISOString(),
  updated_at: async () => new Date().toISOString()
});

export const chatsExternalResolver = resolve<Chats, HookContext<ChatsService>>({});

// Schema for creating new entries
export const chatsDataSchema = Type.Pick(chatsSchema, ['title', 'user_id', 'model'], {
  $id: 'ChatsData'
});
export type ChatsData = Static<typeof chatsDataSchema>;
export const chatsDataValidator = getValidator(chatsDataSchema, dataValidator);
export const chatsDataResolver = resolve<Chats, HookContext<ChatsService>>({
  created_at: async () => new Date().toISOString(),
  updated_at: async () => new Date().toISOString()
});

// Schema for updating existing entries
export const chatsPatchSchema = Type.Partial(chatsSchema, {
  $id: 'ChatsPatch'
});
export type ChatsPatch = Static<typeof chatsPatchSchema>;
export const chatsPatchValidator = getValidator(chatsPatchSchema, dataValidator);
export const chatsPatchResolver = resolve<Chats, HookContext<ChatsService>>({
  updated_at: async () => new Date().toISOString()
});

// Schema for allowed query properties
export const chatsQueryProperties = Type.Pick(chatsSchema, ['_id', 'title', 'user_id', 'model']);
export const chatsQuerySchema = Type.Intersect(
  [
    querySyntax(chatsQueryProperties),
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
);
export type ChatsQuery = Static<typeof chatsQuerySchema>;
export const chatsQueryValidator = getValidator(chatsQuerySchema, queryValidator);
export const chatsQueryResolver = resolve<ChatsQuery, HookContext<ChatsService>>({});