import {
  ActionArgs,
  json,
  LoaderArgs,
  LoaderFunction,
  SessionData,
} from '@remix-run/cloudflare'
import { Form, Link, useActionData, useLoaderData, useTransition } from '@remix-run/react'
import { phone as parsePhone } from 'phone'
import { FocusEvent, useState } from 'react'
import invariant from 'tiny-invariant'
import { check, verify } from '~/api/verify'
import { EnvData } from '~/types'
import { ExclamationCircleIcon } from '@heroicons/react/20/solid'
import { ValidatedForm } from 'remix-validated-form'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import FormInput from '~/components/FormInput'

const codeRegex = /^\d{4}$/

export const validator = withZod(
  z.object({
    phone: z
      .string()
      .refine(val => parsePhone(val).isValid, { message: 'invalid phone number' }),
    code: z
      .string()
      .refine(val => (val ? val.match(codeRegex) : true), { message: 'must be 4 digits' })
      .optional(),
    // code: z.coerce.number().int().gt(999).lte(9999).optional(),

    // email: z
    //   .string()
    //   .min(1, { message: 'Email is required' })
    //   .email('Must be a valid email'),
  })
)

export const loader: LoaderFunction = async ({ context, request }: LoaderArgs) => {
  const { authed, userId } = context.session as SessionData
  console.log('ENV', context.env)

  return json({ authed, userId })
}

export async function action({ request, params, context }: ActionArgs) {
  let formData = await request.formData()
  let env = context.env as EnvData
  const { intent, phone, code } = Object.fromEntries(formData) as Record<string, string>
  console.log('MAIN ACTION FORM', formData)
  console.log('MAIN ACTION INTENT', intent, phone, code)

  const parsed = parsePhone(phone)
  if (!parsed.isValid)
    return json({ error: 'Validation Error', message: 'Phone is invalid' })

  // invariant(, 'phone is invalid')
  const _phone = parsed.phoneNumber

  const { authed, userId, session, sessionStorage } = context.session as SessionData
  console.log('MAIN ACTION SESSION', session.data)

  if (intent === 'signin' && !userId) {
    const result = await verify(env, _phone, 'sms')
    console.log('VERIFY RESULT', result)

    if (result) {
      return json({
        verify: true,
        message: 'We sent an sms with a link to join, or copy the code to verify here',
      })
    }

    // const userId = Math.floor(Math.random() * 10000000)
    // session.set('userId', userId)
    // let headers = { 'Set-Cookie': await sessionStorage.commitSession(session) }
    // return json({ authed: true, userId }, { headers })
  } else if (intent === 'check' && code) {
    const result = await check(env, _phone, code)
    console.log('CHECK RESULT', result)
    if (result) {
      session.set('userId', _phone)
      let headers = { 'Set-Cookie': await sessionStorage.commitSession(session) }
      return json({ authed: true, userId, message: 'sign in successful' }, { headers })
    }
  }
  return null
  // session.flash('success', 'You have been logged out')
}

export default function Index() {
  const { authed, userId } = useLoaderData()
  const actionData = useActionData()
  const transition = useTransition()

  console.log('ACTION DATA', actionData)

  const [phoneError, setPhoneError] = useState('')
  const checkPhone = (e: any) => {
    const phone = parsePhone(e.target.value)
    if (!phone.isValid) setPhoneError('Invalid number')
    else setPhoneError('')
  }

  const state: 'idle' | 'error' | 'verify' | 'authed' = authed
    ? 'authed'
    : actionData?.error || phoneError
    ? 'error'
    : actionData?.verify
    ? 'verify'
    : 'idle'

  if (authed) return <div>Hi {String(userId)}</div>

  const isError = state === 'error'
  const isVerify = state === 'verify'

  return (
    <>
      <div className='flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8'>
        <div className='sm:mx-auto sm:w-full sm:max-w-md'>
          <h2 className='mt-6 text-center text-3xl font-bold tracking-tight'>Sign in</h2>
        </div>

        <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
          <div className='bg-white text-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10'>
            <ValidatedForm className='space-y-6' validator={validator} method='post'>
              <FormInput name='phone' label='Mobile Phone' type='phone' />
              {/* <div>
                <label
                  htmlFor='phone'
                  className='block text-sm font-medium text-gray-700'>
                  Mobile phone
                </label>
                <div className='relative mt-1 rounded-md shadow-sm'>
                  <input
                    id='phone'
                    name='phone'
                    type='phone'
                    autoComplete='phone'
                    onBlur={e => checkPhone(e)}
                    onChange={e => (isError ? checkPhone(e) : '')}
                    required
                    className={`block w-full rounded-md border focus:outline-none sm:text-sm shadow-sm px-3 py-2 pr-10 ${
                      isError
                        ? ' border-red-300 text-red-900 placeholder-red-300 focus:border-red-500  focus:ring-red-500 '
                        : ' text-gray-800 border-gray-300  placeholder-gray-400  focus:border-indigo-500 focus:ring-indigo-500 '
                    }`}
                  />
                  {isError ? (
                    <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
                      <ExclamationCircleIcon
                        className='h-5 w-5 text-red-500'
                        aria-hidden='true'
                      />
                    </div>
                  ) : (
                    ''
                  )}
                </div>
                <p className='mt-2 text-sm text-red-600'>
                  {actionData?.error ? actionData.message : phoneError ? phoneError : ''}
                </p>
              </div> */}

              {isVerify || true ? (
                <FormInput name='code' label='Verify code' />
              ) : (
                // <div>
                //   <label
                //     htmlFor='code'
                //     className='block text-sm font-medium text-gray-700'>
                //     Verify code
                //   </label>
                //   <div className='mt-1'>
                //     <input
                //       id='code'
                //       name='code'
                //       type='number'
                //       autoComplete='code'
                //       maxLength={4}
                //       required
                //       className='block w-full appearance-none rounded-md border text-gray-800 border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                //     />
                //   </div>
                // </div>
                ''
              )}
              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <input
                    id='remember'
                    name='remember'
                    type='checkbox'
                    className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500'
                  />
                  <label htmlFor='remember' className='ml-2 block text-sm text-gray-900'>
                    Remember me
                  </label>
                </div>
              </div>

              <div>
                <button
                  type='submit'
                  name='intent'
                  value={isVerify ? 'check' : 'signin'}
                  className='flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'>
                  Sign in
                </button>
              </div>
            </ValidatedForm>
          </div>
        </div>
      </div>
    </>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)
  return (
    <div>
      <p>
        Oops! {error.name} {error.message}
      </p>
    </div>
  )
}
