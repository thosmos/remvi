import type { MetaFunction, LinksFunction, ActionArgs } from '@remix-run/cloudflare'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'

import styles from './tailwind.css'
export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  { rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
]

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'remvi',
  viewport: 'width=device-width,initial-scale=1',
})

export default function App() {
  return (
    <html lang='en-US'>
      <head>
        <Meta />
        <Links />
      </head>
      <body className='bg-gray-800 text-white'>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        {/* add the UI you want your users to see */}
        <Scripts />
      </body>
    </html>
  )
}
