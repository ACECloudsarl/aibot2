// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Chats, ChatsData, ChatsPatch, ChatsQuery } from './chats.schema'

export type { Chats, ChatsData, ChatsPatch, ChatsQuery }

export interface ChatsParams extends MongoDBAdapterParams<ChatsQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class ChatsService<ServiceParams extends Params = ChatsParams> extends MongoDBService<
  Chats,
  ChatsData,
  ChatsParams,
  ChatsPatch
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then(db => db.collection('chats'))
  }
}
