import { VercelRequest, VercelResponse } from '@vercel/node'
import app from '../src/app'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Passa a requisição para o Express
  return app(req, res)
}
