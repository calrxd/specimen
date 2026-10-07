export type AvatarSize = 'sm' | 'md' | 'lg'
export type AvatarStatus = 'none' | 'online' | 'away' | 'busy'

export type AvatarProps = {
  /** The person or workspace the avatar stands for. Gives the initials and the accessible name. */
  name: string
  /** A photo or logo URL. Without one, the initials show. */
  src?: string
  /** sm in tables and lists, md in headers and comments, lg on profile pages. */
  size?: AvatarSize
  /** A presence dot at the lower right, in the status colours. */
  status?: AvatarStatus
}

const SIZE: Record<AvatarSize, string> = {
  sm: 'size-2xl text-micro',
  md: 'size-3xl text-caption',
  lg: 'size-5xl text-body',
}

// The presence dot scales with the avatar so it never covers the initials at sm.
const DOT: Record<AvatarSize, string> = { sm: 'size-xs ring-1', md: 'size-sm ring-2', lg: 'size-md ring-2' }

// Less overlap at sm, where a full step would hide most of each initial.
const OVERLAP: Record<AvatarSize, string> = { sm: '-space-x-xs', md: '-space-x-sm', lg: '-space-x-md' }

const STATUS: Record<Exclude<AvatarStatus, 'none'>, { className: string; label: string }> = {
  online: { className: 'bg-success', label: 'online' },
  away: { className: 'bg-warn', label: 'away' },
  busy: { className: 'bg-danger', label: 'busy' },
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

/**
 * A round image or the initials of a person or workspace. It belongs to the dot family, so it
 * is the one fully round element besides the radio and the switch. The surface fill and
 * hairline keep initials legible in both themes; a status dot ringed in the canvas colour
 * shows presence.
 */
export function Avatar({ name, src, size = 'md', status = 'none' }: AvatarProps) {
  const presence = status !== 'none' ? STATUS[status] : null
  return (
    <span
      role="img"
      aria-label={presence ? `${name}, ${presence.label}` : name}
      className={['relative inline-flex shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface font-mono text-muted', SIZE[size]].join(' ')}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- a library component cannot assume next/image is configured
        <img src={src} alt="" className="size-full rounded-full object-cover" />
      ) : (
        <span aria-hidden>{initialsOf(name)}</span>
      )}
      {presence && (
        <span aria-hidden className={['absolute right-none bottom-none rounded-full ring-canvas', DOT[size], presence.className].join(' ')} />
      )}
    </span>
  )
}

export type AvatarGroupPerson = { name: string; src?: string }

export type AvatarGroupProps = {
  /** The people in the group, in order. Content, not a Figma property: the library shows four and a count. */
  people: AvatarGroupPerson[]
  /** How many avatars show before the rest collapse into a "+3" count. */
  max?: number
  /** Size of every avatar in the group. */
  size?: AvatarSize
}

/**
 * A row of overlapping avatars for the people on a record: assignees, reviewers, members.
 * Each avatar is ringed in the canvas colour so the overlap reads as a stack, and anyone past
 * max is counted in a final circle.
 */
export function AvatarGroup({ people, max = 4, size = 'md' }: AvatarGroupProps) {
  const shown = people.slice(0, max)
  const rest = people.length - shown.length
  return (
    <span role="group" aria-label={`${people.length} ${people.length === 1 ? 'person' : 'people'}`} className={['inline-flex items-center', OVERLAP[size]].join(' ')}>
      {shown.map((p) => (
        <span key={p.name} className="rounded-full ring-2 ring-canvas">
          <Avatar name={p.name} src={p.src} size={size} />
        </span>
      ))}
      {rest > 0 && (
        <span
          role="img"
          aria-label={`${rest} more`}
          className={['inline-flex shrink-0 items-center justify-center rounded-full border border-line-strong bg-canvas font-mono text-muted ring-2 ring-canvas', SIZE[size]].join(' ')}
        >
          +{rest}
        </span>
      )}
    </span>
  )
}
