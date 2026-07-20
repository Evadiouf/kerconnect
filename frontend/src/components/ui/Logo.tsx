// HAD — KerConnect · Naratechvision
import Image from 'next/image'

interface LogoProps {
  width?: number
  priority?: boolean
}

export function KerConnectLogo({ width = 130, priority = false }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="KerConnect"
      width={width}
      height={Math.round(width * 196 / 207)}
      style={{ height: 'auto', display: 'block' }}
      priority={priority}
      unoptimized
    />
  )
}
