import { ActionArgs } from '@remix-run/cloudflare'
import { phone as parsePhone } from 'phone'
import { Data } from '~/types'

export const emailRegex =
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
/**
 * readRequestBody reads in the incoming request body
 * Use await readRequestBody(..) in an async function to get the string
 * @param {Request} request the incoming request to read from
 */
async function readRequestBody(request: Request) {
  const { headers } = request
  const contentType = headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return await request.json()
  }
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Content-type': 'application/json',
}

export const verify = async (env: Data, to: string, channel: string) => {
  const url = `https://verify.twilio.com/v2/Services/${env.TWILIO_SERVICE}/Verifications`

  let data = new FormData()
  data.append('To', to)
  data.append('Channel', channel)

  console.log('VERIFY', channel, to)

  const init = {
    body: data,
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(env.TWILIO_UID + ':' + env.TWILIO_KEY)}` },
  }
  try {
    const response = await fetch(url, init)

    console.log('VERIFY RESULT', response)

    if (response.status < 300) {
      const res = await response.json()
      const { date_updated, channel, to } = res as Data
      console.log('VERIFY RES', res)

      //   await env.WTF_unverified.put(to, JSON.stringify(res), {
      //     metadata: { date: date_updated, type: channel },
      //   })
      return res
    }
  } catch (err) {
    console.error('VERIFY ERR', err)
  }
  return
}

export const check = async (env: Data, to: string, code: string) => {
  const url = `https://verify.twilio.com/v2/Services/${env.TWILIO_SERVICE}/VerificationCheck`

  let data = new FormData()
  data.append('To', to)
  data.append('Code', code)

  console.log('CHECK', to, code)
  const init = {
    body: data,
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(env.TWILIO_UID + ':' + env.TWILIO_KEY)}` },
  }
  try {
    const response = await fetch(url, init)
    console.log('CHECK RESULT', response)

    if (response.status < 300) {
      const res = (await response.json()) as Data
      console.log('CHECK RES', res)
      if (res.status === 'approved') {
        const { date_updated, channel, to } = res
        // await env.WTF_unverified.delete(to)
        // await env.WTF.put(to, JSON.stringify(res), {
        //   metadata: { date: date_updated, type: channel },
        // })
        return res
      }
    }
  } catch (err) {
    console.error('CHECK ERR', err)
  }
  return
}

export async function onAction(args: ActionArgs) {
  const { request, context } = args

  const env = context.env as Data

  if (request.method === 'POST') {
    const req = (await readRequestBody(request)) as Data | undefined
    console.log('REQUEST', JSON.stringify(req))

    const { data, token } = req || {}

    let to = ''
    let channel = ''
    let action = ''

    if (data.match(emailRegex)) {
      to = data
      channel = 'email'
    } else {
      const ph = parsePhone(data)
      const { isValid, phoneNumber, countryIso2 } = ph

      if (isValid) {
        to = phoneNumber
        channel = 'sms'
      } else {
        return new Response(
          JSON.stringify({ message: 'Invalid mobile number or email' }),
          { headers, status: 400 }
        )
      }
    }

    let res = null
    if (token) {
      res = await check(env, to, token)
      action = `Verified and saved!`
    } else {
      res = await verify(env, to, channel)
      action = `Verification ${channel} sent`
    }
    if (!res) {
      console.error(res)
      return new Response(
        JSON.stringify({ error: 'Error', message: 'Verification failed' }),
        { headers, status: 500 }
      )
    } else {
      return new Response(action, { headers })
    }
  } else {
    return new Response(`Unknown request`, { headers, status: 400 })
  }
}

// Respond to OPTIONS method
export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
  })
}
