// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  uploadDataValidator,
  uploadPatchValidator,
  uploadQueryValidator,
  uploadResolver,
  uploadExternalResolver,
  uploadDataResolver,
  uploadPatchResolver,
  uploadQueryResolver
} from './upload.schema'

import type { Application } from '../../declarations'
import { UploadService, getOptions } from './upload.class'
import { uploadPath, uploadMethods } from './upload.shared'

export * from './upload.class'
export * from './upload.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const upload = (app: Application) => {
  // Register our service on the Feathers application
  app.use(uploadPath, new UploadService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: uploadMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(uploadPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(uploadExternalResolver),
        schemaHooks.resolveResult(uploadResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(uploadQueryValidator), schemaHooks.resolveQuery(uploadQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(uploadDataValidator), schemaHooks.resolveData(uploadDataResolver)],
      patch: [schemaHooks.validateData(uploadPatchValidator), schemaHooks.resolveData(uploadPatchResolver)],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [uploadPath]: UploadService
  }
}
