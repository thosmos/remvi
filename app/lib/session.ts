import { createCloudflareKVSessionStorage, SessionStorage } from '@remix-run/cloudflare'

export function createKVSessionStorage(kv: KVNamespace): SessionStorage {
  return createCloudflareKVSessionStorage({
    cookie: {
      name: 'SESSION_ID',
      secrets: ['YOUR_COOKIE_SECRET'],
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 10000,
      sameSite: 'strict',
    },
    kv,
  })
}
