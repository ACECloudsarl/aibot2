// For more information about this file see https://dove.feathersjs.com/guides/cli/authentication.html
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'
import { oauth, OAuthStrategy } from '@feathersjs/authentication-oauth'

import type { Application } from './declarations'

declare module './declarations' {
  interface ServiceTypes {
    authentication: AuthenticationService
  }
}

export const authentication = (app: Application) => {
  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());
  authentication.register('google', new OAuthStrategy());
  authentication.register('facebook', new OAuthStrategy());

  app.use('authentication', authentication);
  app.configure(oauth());
  
  // Hook that runs after successful authentication
  app.service('authentication').hooks({
    after: {
      create: [
        context => {
          // Add the user's profile info to the returned JWT payload
          if (context.result.user) {
            const { user } = context.result;
            context.result.user = {
              _id: user._id,
              email: user.email,
              full_name: user.full_name,
              avatar_url: user.avatar_url
            };
          }
          return context;
        }
      ]
    }
  });
}
