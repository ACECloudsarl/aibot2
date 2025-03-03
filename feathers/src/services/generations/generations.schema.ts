// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { GenerationsService } from './generations.class'

// Main data model schema
export const generationsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    text: Type.String()
  },
  { $id: 'Generations', additionalProperties: false }
)
export type Generations = Static<typeof generationsSchema>
export const generationsValidator = getValidator(generationsSchema, dataValidator)
export const generationsResolver = resolve<Generations, HookContext<GenerationsService>>({})

export const generationsExternalResolver = resolve<Generations, HookContext<GenerationsService>>({})

// Schema for creating new entries
export const generationsDataSchema = Type.Pick(generationsSchema, ['text'], {
  $id: 'GenerationsData'
})
export type GenerationsData = Static<typeof generationsDataSchema>
export const generationsDataValidator = getValidator(generationsDataSchema, dataValidator)
export const generationsDataResolver = resolve<Generations, HookContext<GenerationsService>>({})

// Schema for updating existing entries
export const generationsPatchSchema = Type.Partial(generationsSchema, {
  $id: 'GenerationsPatch'
})
export type GenerationsPatch = Static<typeof generationsPatchSchema>
export const generationsPatchValidator = getValidator(generationsPatchSchema, dataValidator)
export const generationsPatchResolver = resolve<Generations, HookContext<GenerationsService>>({})

// Schema for allowed query properties
export const generationsQueryProperties = Type.Pick(generationsSchema, ['_id', 'text'])
export const generationsQuerySchema = Type.Intersect(
  [
    querySyntax(generationsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type GenerationsQuery = Static<typeof generationsQuerySchema>
export const generationsQueryValidator = getValidator(generationsQuerySchema, queryValidator)
export const generationsQueryResolver = resolve<GenerationsQuery, HookContext<GenerationsService>>({})
