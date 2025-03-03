// src/services/message/message.schema.ts - Updated schema
import { resolve } from '@feathersjs/schema';
import { Type, getValidator, querySyntax } from '@feathersjs/typebox';
import { ObjectIdSchema } from '@feathersjs/typebox';
import type { Static } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';
import type { MessageService } from './message.class';

// Main data model schema
export const messageSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    chat_id: Type.String(),
    content: Type.String(),
    role: Type.String(),
    content_type: Type.Optional(Type.String()),
    metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
    created_at: Type.Optional(Type.String({ format: 'date-time' }))
  },
  { $id: 'Message', additionalProperties: false }
);

export type Message = Static<typeof messageSchema>;
export const messageValidator = getValidator(messageSchema, dataValidator);
export const messageResolver = resolve<Message, HookContext<MessageService>>({
  created_at: async () => new Date().toISOString()
});

export const messageExternalResolver = resolve<Message, HookContext<MessageService>>({});

// Schema for creating new entries
export const messageDataSchema = Type.Pick(messageSchema, ['chat_id', 'content', 'role', 'content_type', 'metadata'], {
  $id: 'MessageData'
});
export type MessageData = Static<typeof messageDataSchema>;
export const messageDataValidator = getValidator(messageDataSchema, dataValidator);
export const messageDataResolver = resolve<Message, HookContext<MessageService>>({
  created_at: async () => new Date().toISOString()
});

// Schema for updating existing entries
export const messagePatchSchema = Type.Partial(messageSchema, {
  $id: 'MessagePatch'
});
export type MessagePatch = Static<typeof messagePatchSchema>;
export const messagePatchValidator = getValidator(messagePatchSchema, dataValidator);
export const messagePatchResolver = resolve<Message, HookContext<MessageService>>({});

// Schema for allowed query properties
export const messageQueryProperties = Type.Pick(messageSchema, ['_id', 'chat_id', 'role', 'content_type']);
export const messageQuerySchema = Type.Intersect(
  [
    querySyntax(messageQueryProperties),
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
);
export type MessageQuery = Static<typeof messageQuerySchema>;
export const messageQueryValidator = getValidator(messageQuerySchema, queryValidator);
export const messageQueryResolver = resolve<MessageQuery, HookContext<MessageService>>({});