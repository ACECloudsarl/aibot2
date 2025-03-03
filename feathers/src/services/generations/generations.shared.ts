// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  Generations,
  GenerationsData,
  GenerationsPatch,
  GenerationsQuery,
  GenerationsService
} from './generations.class'

export type { Generations, GenerationsData, GenerationsPatch, GenerationsQuery }

export type GenerationsClientService = Pick<
  GenerationsService<Params<GenerationsQuery>>,
  (typeof generationsMethods)[number]
>

export const generationsPath = 'generations'

export const generationsMethods: Array<keyof GenerationsService> = [
  'find',
  'get',
  'create',
  'patch',
  'remove'
]

export const generationsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(generationsPath, connection.service(generationsPath), {
    methods: generationsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [generationsPath]: GenerationsClientService
  }
}
