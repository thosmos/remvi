import { ExclamationCircleIcon } from '@heroicons/react/20/solid'
import { useField } from 'remix-validated-form'
import { ElementRef, forwardRef, Ref } from 'react'

type MyInputProps = {
  name: string
  label: string
  type?: string
  readOnly?: boolean
}

const MyInput = forwardRef(
  (
    { name, label, readOnly = false, type = 'text' }: MyInputProps,
    ref: Ref<HTMLInputElement>
  ) => {
    const { error, getInputProps } = useField(name)
    return (
      <div>
        <label htmlFor={name} className='block text-sm font-medium text-gray-700'>
          {label}
        </label>
        <div className='relative mt-1 rounded-md shadow-sm'>
          <input
            {...getInputProps({ id: name })}
            ref={ref}
            readOnly={readOnly}
            type={type}
            className={`block w-full rounded-md border focus:outline-none sm:text-sm shadow-sm px-3 py-2 pr-10 ${
              error
                ? ' border-red-300 text-red-900 placeholder-red-300 focus:border-red-500  focus:ring-red-500 '
                : ' text-gray-800 border-gray-300  placeholder-gray-400  focus:border-indigo-500 focus:ring-indigo-500 '
            }`}
          />
          {error ? (
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
        {error && <span className='mt-2 text-sm text-red-600'>{error}</span>}
      </div>
    )
  }
)

export default MyInput
