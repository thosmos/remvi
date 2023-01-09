import { json, LoaderArgs } from '@remix-run/cloudflare'
import { Link, useLoaderData } from '@remix-run/react'
import { getPosts } from '~/models/post.server'

const d1 = '95d8ea61-e700-4eb3-926e-8b91610e6cfd'

const endpoint = (key: string, accountID: string, namespaceID: string) =>
  `https://api.cloudflare.com/client/v4/accounts/${accountID}/storage/kv/namespaces/${namespaceID}/values/${key}`

export const loader = async ({ context }: LoaderArgs) => {
  // const { success, result, errors } = await fetch(endpoint("MY_KEY","",""), {
  //   method: "GET",
  //   headers: {
  //     Authorization: `Bearer ${process.env.CLOUDFLARE_KV_API_TOKEN}`,
  //     "Content-Type": "application/json",
  //   }
  // }).then(response => response.json())

  // const body = JSON.stringify(req.query.value)
  // const { success, result, errors } = await fetch(endpoint("MY_KEY","",""), {
  //   method: "PUT",
  //   headers: {
  //     Authorization: `Bearer ${process.env.CLOUDFLARE_KV_API_TOKEN}`,
  //     "Content-Type": "application/json",
  //   },
  //   body
  // }).then(response => response.json())

  //https://drand.cloudflare.com/8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce/public/latest
  //{ "round": 2594419, "randomness": "eefd84d26b6fb1ae46a61c578e62668c89cc5cf0a67d7ff566d6889b3d469838", "signature": "89fdcc1b5c1440479520a8cf7d8fd657cee196026a8709e1ffc5020a7eea2f9331f2ed6784c794e8ae792e9f4563885b169372080e9fe2aeef63f5ad71d60309711441370a5e2d6788d5d9f341336d0146353d8da0b2791edf35aa403385dc12", "previous_signature": "9611f3413530706f86e0745882041add0ec71aa9684e960602362a5dfdee0371cf5aae2e4f319395a937d8b21117ad3f193b555af0f8315a4d943461538c8f184615b6e4ec7f7e013628fa8d253b3535fd091e1f29b9c077ba13c849188c80f2" }

  await context.REMVI_KV.put('hmm', 'ahoy', {
    metadata: { more: 'here', type: 'sms' },
  })
  let list = await context.REMVI_KV.list()

  return json({
    posts: await getPosts(),
    secret: context.SOME_SECRET,
    list: JSON.stringify(list),
  })
}

export default function Index() {
  const { posts, secret, list } = useLoaderData<typeof loader>()
  console.log(posts)

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Welcome to Remix</h1>
      <ul>
        <li>A secret: {secret}</li>
        <li>A KV list: {list}</li>
        <li>
          <a target='_blank' href='https://remix.run/docs' rel='noreferrer'>
            Remix Docs
          </a>
        </li>
      </ul>
      <h1>Posts</h1>
      <ul>
        {posts.map(post => (
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
