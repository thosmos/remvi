import { json, LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'
import { Link, useLoaderData } from '@remix-run/react'
import { getPosts } from '~/api/post.server'

type LoaderData = {
  posts: Awaited<ReturnType<typeof getPosts>>
}

export const loader: LoaderFunction = async ({ context }: LoaderArgs) => {
  const posts = await getPosts(context)

  return json<LoaderData>({
    posts,
  })
}

export default function Posts() {
  const { posts } = useLoaderData() as LoaderData

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Posts</h1>
      <ul className='list-disc list-inside'>
        {posts?.map(post => (
          <li key={post.slug}>
            <Link to={post.slug} className='text-blue-600 underline'>
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
