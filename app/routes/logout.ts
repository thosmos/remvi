import {
  ActionArgs,
  AppLoadContext,
  LoaderArgs,
  LoaderFunction,
  redirect,
  Session,
  SessionData,
} from '@remix-run/cloudflare'

const resetSession = async (context: AppLoadContext) => {
  const { sessionStorage, session } = context.session as SessionData
  sessionStorage.destroySession(session)

  const newSession = (await sessionStorage.getSession()) as Session
  // and set the flash message
  session.flash('success', 'You have been logged out')

  // and commit the session while sending a response
  return redirect('/', {
    headers: { 'Set-Cookie': await sessionStorage.commitSession(newSession) },
  })
}

export const loader: LoaderFunction = async ({ context }: LoaderArgs) => {
  return resetSession(context)
}

export async function action({ context, request }: ActionArgs) {
  return resetSession(context)
}
