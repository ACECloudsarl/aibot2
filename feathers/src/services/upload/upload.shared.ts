// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Upload, UploadData, UploadPatch, UploadQuery, UploadService } from './upload.class'

export type { Upload, UploadData, UploadPatch, UploadQuery }

export type UploadClientService = Pick<UploadService<Params<UploadQuery>>, (typeof uploadMethods)[number]>

export const uploadPath = 'upload'

export const uploadMethods: Array<keyof UploadService> = ['find', 'get', 'create', 'patch', 'remove']

export const uploadClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(uploadPath, connection.service(uploadPath), {
    methods: uploadMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [uploadPath]: UploadClientService
  }
}
