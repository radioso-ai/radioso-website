import Image from 'next/image'

type Props = {
  imageClassName?: string
  className?: string
  priority?: boolean
}

export function Logo({
  imageClassName = 'h-9 w-auto sm:h-10',
  className,
  priority = false,
}: Props) {
  return (
    <span className={['relative inline-flex items-center', className].filter(Boolean).join(' ')}>
      <Image
        src="/radioso-lockup.svg"
        alt="Radioso"
        width={983}
        height={300}
        priority={priority}
        className={['dark:hidden', imageClassName].join(' ')}
      />
      <Image
        src="/radioso-lockup-dark.svg"
        alt=""
        width={983}
        height={300}
        priority={priority}
        className={['hidden dark:block', imageClassName].join(' ')}
      />
    </span>
  )
}
