import Image from 'next/image'
import Link from 'next/link'

export function AppLogo() {
  return (
    <Link className="inline-flex items-center" href="/" aria-label="GMASS home">
      <Image src="/images/logo.svg" alt="GMASS" width={132} height={36} priority />
    </Link>
  )
}
