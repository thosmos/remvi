import { Form, Outlet, useLoaderData } from '@remix-run/react'

import { Fragment, ReactNode, useState } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import {
  ActionArgs,
  json,
  LoaderArgs,
  redirect,
  Session,
  SessionData,
  SessionStorage,
} from '@remix-run/cloudflare'
import { getRnd, RndData } from './random'

const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}
const navigation = [
  { name: 'Dashboard', href: '#', current: true },
  { name: 'Daily Remvi', href: '#', current: false },
]
const userNavigation = [
  { name: 'Your Profile', intent: 'profile' },
  { name: 'Settings', intent: 'settings' },
  { name: 'Sign out', intent: 'signout' },
]

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

export async function loader(args: LoaderArgs) {
  const { context, request } = args

  // console.log('LOADER ARGS', args)

  // console.log('LOADER CONTEXT', context)

  const { authed, userId } = context.session as SessionData

  // console.log('MAIN userId', userId)
  const headers: Record<string, string> = {}

  return json({ authed }, { headers })
}

export default function Example({ children }: { children: ReactNode }) {
  const { authed } = useLoaderData<typeof loader>()

  return (
    <>
      <div className=''>
        <div className='bg-gray-800 pb-32'>
          <div className='mx-auto max-w-7xl sm:px-6 lg:px-8'>
            <div className='border-b border-gray-700'>
              <div className='flex h-16 items-center justify-between px-4 sm:px-0'>
                <div className='flex items-center'>
                  <div className='text-white font-bold'>Remvi</div>
                </div>
                {authed ? (
                  <div className={'items-center justify-end md:flex md:flex-1 lg:w-0'}>
                    <Form method='post' action={authed ? '/logout' : '/?index'}>
                      <button
                        type='submit'
                        name='intent'
                        value={authed ? 'signout' : 'signin'}
                        className='ml-8 inline-flex items-center justify-center whitespace-nowrap rounded-md border border-transparent bg-gradient-to-r from-purple-600 to-indigo-600 bg-origin-border px-4 py-2 text-base font-medium text-white shadow-sm hover:from-purple-700 hover:to-indigo-700'>
                        {authed ? 'Sign out' : 'Sign in'}
                      </button>
                    </Form>
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>
          </div>
        </div>

        <main className='-mt-32'>
          <div className='mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8'>
            <Outlet />
          </div>
        </main>
      </div>
    </>
  )
}
