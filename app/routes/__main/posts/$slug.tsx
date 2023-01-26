import type { LoaderArgs, AppLoadContext } from '@remix-run/cloudflare'
import { Post, Posts, initPosts } from '~/api/post.server'
import { json } from '@remix-run/cloudflare'
import { useLoaderData, useCatch } from '@remix-run/react'

export const loader = async ({ params, context }: LoaderArgs) => {
  const { slug } = params
  const db = context.REMVI_DB as D1Database

  await initPosts(db)

  const post = await Posts.First({ where: { slug } })
  if (!post) throw new Response('Not Found', { status: 404 })

  //   const orm = new D1Orm(db)
  //   const post = await db
  //     .prepare('SELECT * from posts where slug = ?1')
  //     .bind(params.slug)
  //     .first()

  return json(post)
}

export default function PostSlug() {
  const post = useLoaderData()

  return (
    <main className=''>
      <h1 className=''>
        {post.title} : {post.slug}
      </h1>
    </main>
  )
}

export function CatchBoundary() {
  const caught = useCatch()
  if (caught.status === 404) return <div>Uh Oh! That post does not exist</div>
  throw new Error(`unsupported thrown status code ${caught.status}`)
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)
  return (
    <div>
      {error.name} {error.message}
    </div>
  )
}
