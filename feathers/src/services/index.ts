import { upload } from './upload/upload'
import { generations } from './generations/generations'
import { message } from './message/message'
import { chats } from './chats/chats'
import { user } from './users/users'
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(upload)
  app.configure(generations)
  app.configure(message)
  app.configure(chats)
  app.configure(user)
  // All services will be registered here
}
