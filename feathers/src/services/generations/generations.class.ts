// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Generations, GenerationsData, GenerationsPatch, GenerationsQuery } from './generations.schema'

export type { Generations, GenerationsData, GenerationsPatch, GenerationsQuery }

export interface GenerationsParams extends MongoDBAdapterParams<GenerationsQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class GenerationsService<ServiceParams extends Params = GenerationsParams> extends MongoDBService<
  Generations,
  GenerationsData,
  GenerationsParams,
  GenerationsPatch
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then(db => db.collection('generations'))
  }
}
