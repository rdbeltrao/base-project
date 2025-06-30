import { VercelRequest, VercelResponse } from '@vercel/node'
import express from 'express'
import { initDatabase } from '../src/app'

let app: express.Application

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!app) {
    const appModule = await import('../src/app')
    app = appModule.default
    await initDatabase()
  }
  return app(req, res)
}
