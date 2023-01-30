import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages'
import { createCloudflareKVSessionStorage, SessionStorage } from '@remix-run/cloudflare'
import * as build from '@remix-run/dev/server-build'

export function createKVSessionStorage(kv, cookie_secret) {
  return createCloudflareKVSessionStorage({
    cookie: {
      name: 'SESSION_ID',
      secrets: [cookie_secret],
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 10000,
      sameSite: 'strict',
    },
    kv,
  })
}

const handleRequest = async context => {
  const { request } = context

  const sessionStorage = createKVSessionStorage(
    context.env.REMVI_KV,
    context.env.COOKIE_SECRET
  )
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))
  const userId = await session.get('userId')
  const authed = !!userId
  context.session = { authed, userId, session, sessionStorage }

  const handler = createPagesFunctionHandler({
    build,
    mode: process.env.NODE_ENV,
    getLoadContext: context => {
      return {
        env: context.env,
        session: context.session,
      }
    },
  })
  return handler(context)
}

export function onRequest(context) {
  return handleRequest(context)
}
