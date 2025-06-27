import * as Icons from 'lucide-react'

type IconRendererName = keyof typeof Icons

export function IconRenderer({ name, ...props }: { name: string } & React.SVGProps<SVGSVGElement>) {
  const Icon = Icons[name as IconRendererName] as React.FC<React.SVGProps<SVGSVGElement>>

  if (!Icon) {
    console.warn(`Ícone "${name}" não encontrado em lucide-react`)
    return null
  }

  return <Icon {...props} />
}
