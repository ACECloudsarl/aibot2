// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from 'assert'
import { app } from '../../../src/app'

describe('chats-service service', () => {
  it('registered the service', () => {
    const service = app.service('chats-service')

    assert.ok(service, 'Registered the service')
  })
})
