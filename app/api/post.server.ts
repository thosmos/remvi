import type { LoaderArgs, AppLoadContext } from '@remix-run/cloudflare'
import type { Infer } from 'd1-orm'
import { json } from '@remix-run/cloudflare'
import { D1Orm, DataTypes, Model } from 'd1-orm'

// export type Post = {
//   slug: string
//   title: string
// }

export const Posts = new Model(
  {
    tableName: 'posts',
    primaryKeys: 'slug',
  },
  {
    slug: { type: DataTypes.TEXT, notNull: true },
    title: { type: DataTypes.TEXT, notNull: true },
  }
)

export const initPosts = async (db: D1Database) => {
  try {
    console.log('getPosts ORM?', Posts.D1Orm)
  } catch (err) {
    await db.exec(
      'DROP TABLE IF EXISTS posts;\n' +
        'CREATE TABLE posts (slug TEXT, title TEXT, PRIMARY KEY (`slug`));\n' +
        `INSERT INTO posts (slug, title) VALUES ('sagacious-magus', 'Sagacious Magus'), ('around-the-horn', 'Around the Horn'), ('tea-time','Time for Tea');`
    )

    const orm = new D1Orm(db)
    Posts.SetOrm(orm)
    // await Posts.CreateTable({ strategy: 'default' /* or "force", see above */ }).catch()
  }
}

export type Post = Infer<typeof Posts>

export async function getPosts(
  context: AppLoadContext
): Promise<Array<Post> | undefined> {
  const db = context.REMVI_DB as D1Database
  await initPosts(db)

  // const stmt: D1PreparedStatement = db.prepare('SELECT slug, title FROM posts LIMIT 3')
  // const { results }: D1Result<Post> = await stmt.all()

  let result = await Posts.All({ limit: 3 })
  let posts = result.results as Post[]

  console.log('posts DB RESULTS', posts)

  return posts
}

export const loader = async (args: LoaderArgs) => {
  const { context } = args

  const posts = await getPosts(context)

  return json({ posts })
}
