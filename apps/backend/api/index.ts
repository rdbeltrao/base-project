import { VercelRequest, VercelResponse } from '@vercel/node'
import express from 'express'
import { initDatabase } from '../src/app'

// Importar o app diretamente do arquivo compilado
let app: express.Application

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Inicializa o app se ainda não estiver inicializado
  if (!app) {
    // Importa dinamicamente o app
    const appModule = await import('../src/app')
    app = appModule.default
    // Inicializa o banco de dados
    await initDatabase()
  }
  // Passa a requisição para o Express
  return app(req, res)
}
