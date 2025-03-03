// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  chatsDataValidator,
  chatsPatchValidator,
  chatsQueryValidator,
  chatsResolver,
  chatsExternalResolver,
  chatsDataResolver,
  chatsPatchResolver,
  chatsQueryResolver
} from './chats.schema'

import type { Application } from '../../declarations'
import { ChatsService, getOptions } from './chats.class'
import { chatsPath, chatsMethods } from './chats.shared'

export * from './chats.class'
export * from './chats.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const chats = (app: Application) => {
  // Register our service on the Feathers application
  app.use(chatsPath, new ChatsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: chatsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(chatsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(chatsExternalResolver),
        schemaHooks.resolveResult(chatsResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(chatsQueryValidator), schemaHooks.resolveQuery(chatsQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(chatsDataValidator), schemaHooks.resolveData(chatsDataResolver)],
      patch: [schemaHooks.validateData(chatsPatchValidator), schemaHooks.resolveData(chatsPatchResolver)],
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
    [chatsPath]: ChatsService
  }
}
