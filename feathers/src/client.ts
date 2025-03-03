// For more information about this file see https://dove.feathersjs.com/guides/cli/client.html
import { feathers } from '@feathersjs/feathers'
import type { TransportConnection, Application } from '@feathersjs/feathers'
import authenticationClient from '@feathersjs/authentication-client'
import type { AuthenticationClientOptions } from '@feathersjs/authentication-client'

import { uploadClient } from './services/upload/upload.shared'
export type { Upload, UploadData, UploadQuery, UploadPatch } from './services/upload/upload.shared'

import { generationsClient } from './services/generations/generations.shared'
export type {
  Generations,
  GenerationsData,
  GenerationsQuery,
  GenerationsPatch
} from './services/generations/generations.shared'

import { messageClient } from './services/message/message.shared'
export type { Message, MessageData, MessageQuery, MessagePatch } from './services/message/message.shared'

import { chatsClient } from './services/chats/chats.shared'
export type { Chats, ChatsData, ChatsQuery, ChatsPatch } from './services/chats/chats.shared'

import { chatsServiceClient } from './services/chats-service/chats-service.shared'
export type {
  ChatsService,
  ChatsServiceData,
  ChatsServiceQuery,
  ChatsServicePatch
} from './services/chats-service/chats-service.shared'

import { chatsClient } from './services/chats/chats.shared'
export type { Chats, ChatsData, ChatsQuery, ChatsPatch } from './services/chats/chats.shared'

import { chatsServiceClient } from './services/chats-service/chats-service.shared'
export type {
  ChatsService,
  ChatsServiceData,
  ChatsServiceQuery,
  ChatsServicePatch
} from './services/chats-service/chats-service.shared'

import { userClient } from './services/users/users.shared'
export type { User, UserData, UserQuery, UserPatch } from './services/users/users.shared'

export interface Configuration {
  connection: TransportConnection<ServiceTypes>
}

export interface ServiceTypes {}

export type ClientApplication = Application<ServiceTypes, Configuration>

/**
 * Returns a typed client for the feathers app.
 *
 * @param connection The REST or Socket.io Feathers client connection
 * @param authenticationOptions Additional settings for the authentication client
 * @see https://dove.feathersjs.com/api/client.html
 * @returns The Feathers client application
 */
export const createClient = <Configuration = any,>(
  connection: TransportConnection<ServiceTypes>,
  authenticationOptions: Partial<AuthenticationClientOptions> = {}
) => {
  const client: ClientApplication = feathers()

  client.configure(connection)
  client.configure(authenticationClient(authenticationOptions))
  client.set('connection', connection)

  client.configure(userClient)
  client.configure(chatsServiceClient)
  client.configure(chatsClient)
  client.configure(chatsServiceClient)
  client.configure(chatsClient)
  client.configure(messageClient)
  client.configure(generationsClient)
  client.configure(uploadClient)
  return client
}
