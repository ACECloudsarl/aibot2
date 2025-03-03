// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  generationsDataValidator,
  generationsPatchValidator,
  generationsQueryValidator,
  generationsResolver,
  generationsExternalResolver,
  generationsDataResolver,
  generationsPatchResolver,
  generationsQueryResolver
} from './generations.schema'

import type { Application } from '../../declarations'
import { GenerationsService, getOptions } from './generations.class'
import { generationsPath, generationsMethods } from './generations.shared'

export * from './generations.class'
export * from './generations.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const generations = (app: Application) => {
  // Register our service on the Feathers application
  app.use(generationsPath, new GenerationsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: generationsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(generationsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(generationsExternalResolver),
        schemaHooks.resolveResult(generationsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(generationsQueryValidator),
        schemaHooks.resolveQuery(generationsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(generationsDataValidator),
        schemaHooks.resolveData(generationsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(generationsPatchValidator),
        schemaHooks.resolveData(generationsPatchResolver)
      ],
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
    [generationsPath]: GenerationsService
  }
}
