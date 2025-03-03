// src/services/generations/generations.schema.ts - Updated schema
import { resolve } from '@feathersjs/schema';
import { Type, getValidator, querySyntax } from '@feathersjs/typebox';
import { ObjectIdSchema } from '@feathersjs/typebox';
import type { Static } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';
import type { GenerationsService } from './generations.class';

// Main data model schema
export const generationsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    user_id: Type.String(),
    chat_id: Type.String(),
    prompt: Type.String(),
    url: Type.String(),
    model: Type.Optional(Type.String()),
    width: Type.Optional(Type.Number()),
    height: Type.Optional(Type.Number()),
    status: Type.Optional(Type.String()),
    metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
    created_at: Type.Optional(Type.String({ format: 'date-time' }))
  },
  { $id: 'Generations', additionalProperties: false }
);

export type Generations = Static<typeof generationsSchema>;
export const generationsValidator = getValidator(generationsSchema, dataValidator);
export const generationsResolver = resolve<Generations, HookContext<GenerationsService>>({
  created_at: async () => new Date().toISOString()
});

export const generationsExternalResolver = resolve<Generations, HookContext<GenerationsService>>({});

// Schema for creating new entries
export const generationsDataSchema = Type.Pick(generationsSchema, 
  ['user_id', 'chat_id', 'prompt', 'url', 'model', 'width', 'height', 'status', 'metadata'], 
  { $id: 'GenerationsData' }
);
export type GenerationsData = Static<typeof generationsDataSchema>;
export const generationsDataValidator = getValidator(generationsDataSchema, dataValidator);
export const generationsDataResolver = resolve<Generations, HookContext<GenerationsService>>({
  created_at: async () => new Date().toISOString()
});

// Schema for updating existing entries
export const generationsPatchSchema = Type.Partial(generationsSchema, {
  $id: 'GenerationsPatch'
});
export type GenerationsPatch = Static<typeof generationsPatchSchema>;
export const generationsPatchValidator = getValidator(generationsPatchSchema, dataValidator);
export const generationsPatchResolver = resolve<Generations, HookContext<GenerationsService>>({});

// Schema for allowed query properties
export const generationsQueryProperties = Type.Pick(generationsSchema, 
  ['_id', 'user_id', 'chat_id', 'model', 'status']
);
export const generationsQuerySchema = Type.Intersect(
  [
    querySyntax(generationsQueryProperties),
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
);
export type GenerationsQuery = Static<typeof generationsQuerySchema>;
export const generationsQueryValidator = getValidator(generationsQuerySchema, queryValidator);
export const generationsQueryResolver = resolve<GenerationsQuery, HookContext<GenerationsService>>({});