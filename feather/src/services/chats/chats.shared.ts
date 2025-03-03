// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Chats, ChatsData, ChatsPatch, ChatsQuery, ChatsService } from './chats.class'

export type { Chats, ChatsData, ChatsPatch, ChatsQuery }

export type ChatsClientService = Pick<ChatsService<Params<ChatsQuery>>, (typeof chatsMethods)[number]>

export const chatsPath = 'chats'

export const chatsMethods: Array<keyof ChatsService> = ['find', 'get', 'create', 'patch', 'remove']

export const chatsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(chatsPath, connection.service(chatsPath), {
    methods: chatsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [chatsPath]: ChatsClientService
  }
}
