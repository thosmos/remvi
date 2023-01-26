import { json, LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'

export type RndData = {
  round: string
  randomness: string
  signature: string
  previous_signature: string
}

export const getRnd = async (): Promise<RndData | undefined> => {
  try {
    const result = await fetch(
      'https://drand.cloudflare.com/8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce/public/latest'
    )
    // console.log('RND result', result)
    let rnd: RndData = (await result.json()) as RndData
    //console.log('RND result', rnd)
    return rnd
  } catch (_) {}
}

export const loader = async () => {
  return json(await getRnd())
}
