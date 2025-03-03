// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Upload, UploadData, UploadPatch, UploadQuery } from './upload.schema'

export type { Upload, UploadData, UploadPatch, UploadQuery }

export interface UploadParams extends MongoDBAdapterParams<UploadQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class UploadService<ServiceParams extends Params = UploadParams> extends MongoDBService<
  Upload,
  UploadData,
  UploadParams,
  UploadPatch
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then(db => db.collection('upload'))
  }
}
