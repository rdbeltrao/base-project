declare module 'passport-google-oauth20' {
  import { Strategy as PassportStrategy } from 'passport-strategy'
  // OAuth2 is used by the library internally
  import { OAuth2 as _OAuth2 } from 'oauth'

  export interface StrategyOptions {
    clientID: string
    clientSecret: string
    callbackURL: string
    scope?: string | string[]
    accessType?: string
    prompt?: string
  }

  export interface StrategyOptionsWithRequest extends StrategyOptions {
    passReqToCallback: true
  }

  export interface VerifyFunction {
    (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback): void
  }

  export interface VerifyFunctionWithRequest {
    (
      req: any,
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ): void
  }

  export type VerifyCallback = (error: any, user?: any, info?: any) => void

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyFunction)
    constructor(options: StrategyOptionsWithRequest, verify: VerifyFunctionWithRequest)
    name: string
    authenticate(req: any, options?: any): void
  }

  export interface Profile {
    id: string
    displayName: string
    name: {
      familyName: string
      givenName: string
      middleName?: string
    }
    emails: Array<{
      value: string
      verified: boolean
    }>
    photos: Array<{
      value: string
    }>
    provider: string
    _raw: string
    _json: any
  }
}
