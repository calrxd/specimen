'use client'

import { useId, useState, type ReactNode } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Drawer } from '@/components/ui/Drawer'

export type AppSidebarItem = {
  id: string
  /** Sentence case, a noun: "Invoices", "Team". */
  label: string
  /** A link destination. Without one the item is a button and calls onSelect. */
  href?: string
  /** A 16px icon, drawn in currentColor. In the collapsed rail it is all that shows. */
  icon?: ReactNode
  /** A count or flag beside the label: 3, "New". */
  badge?: string | number
  /** danger for a count that needs attention, such as failed payments. */
  badgeTone?: 'sample' | 'muted' | 'danger'
  onSelect?: () => void
}

export type AppSidebarGroup = {
  id: string
  /** A short heading over the group. Leave it out for the first, main group. */
  label?: string
  items: AppSidebarItem[]
}

export type AppSidebarProps = {
  /** The product name or logo at the top. */
  brand: ReactNode
  /** The navigation, in groups. */
  groups: AppSidebarGroup[]
  /** The id of the page being shown. It carries aria-current="page" and the sample bar. */
  activeId?: string
  /** Start as the narrow icon rail. */
  defaultCollapsed?: boolean
  /** Called when the person collapses or expands the rail. */
  onCollapsedChange?: (collapsed: boolean) => void
  /** Pinned to the bottom: the workspace switcher, the signed-in person. */
  footer?: ReactNode
  /** Names the navigation landmark. */
  label?: string
}

/**
 * The navigation rail down the left of a product. Groups with short headings, the current page
 * marked by aria-current and a 2px sample bar, badges for counts. It collapses to a rail of icons
 * that name themselves on hover and focus, and below md it becomes a Menu button that opens the
 * same navigation in a Drawer. A nav landmark; links are links and actions are buttons, so the
 * keyboard needs nothing beyond Tab.
 */
export function AppSidebar({
  brand,
  groups,
  activeId,
  defaultCollapsed = false,
  onCollapsedChange,
  footer,
  label: ariaLabel = 'Main',
}: AppSidebarProps) {
  const id = useId()
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [drawer, setDrawer] = useState(false)

  const toggle = () => {
    setCollapsed(!collapsed)
    onCollapsedChange?.(!collapsed)
  }

  return (
    <>
      <div className="flex items-center justify-between gap-md border-b border-line bg-surface px-lg py-md md:hidden">
        <span className="text-body text-ink">{brand}</span>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={drawer}
          onClick={() => setDrawer(true)}
          className="cursor-pointer rounded-sm border border-line-interactive bg-transparent px-md py-xs font-mono text-caption text-ink transition-colors duration-fast hover:bg-canvas"
        >
          Menu
        </button>
      </div>
      <Drawer open={drawer} title="Menu" side="start" onClose={() => setDrawer(false)}>
        <Nav groups={groups} activeId={activeId} collapsed={false} label={ariaLabel} onNavigate={() => setDrawer(false)} />
      </Drawer>

      <aside
        className={[
          'hidden h-full shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-fast motion-reduce:transition-none md:flex',
          // 240px open: wide enough for a label, a badge and the bar; no spacing step is that wide.
          collapsed ? 'w-5xl' : 'w-[15rem]',
        ].join(' ')}
      >
        <div className={['flex min-h-5xl items-center border-b border-line text-body text-ink', collapsed ? 'justify-center px-xs' : 'px-lg'].join(' ')}>
          {collapsed ? <span aria-hidden className="size-sm rounded-full bg-sample-fill" /> : brand}
        </div>
        {/* The rail does not scroll, so the hover labels can sit outside it; the full width scrolls. */}
        <div id={`${id}-nav`} className={['flex min-h-0 flex-1 flex-col py-md', collapsed ? 'overflow-visible' : 'overflow-y-auto'].join(' ')}>
          <Nav groups={groups} activeId={activeId} collapsed={collapsed} label={ariaLabel} />
        </div>
        {footer && !collapsed && <div className="border-t border-line px-lg py-md">{footer}</div>}
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-controls={`${id}-nav`}
          onClick={toggle}
          className={[
            'flex cursor-pointer items-center gap-sm border-0 border-t border-line bg-transparent py-md font-mono text-caption text-muted transition-colors duration-fast hover:text-ink',
            collapsed ? 'justify-center px-xs' : 'px-lg',
          ].join(' ')}
        >
          <svg aria-hidden viewBox="0 0 16 16" className={['size-md transition-transform duration-fast motion-reduce:transition-none', collapsed ? 'rotate-180' : ''].join(' ')}>
            <path d="M10 3.5 5.5 8 10 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className={collapsed ? 'sr-only' : ''}>{collapsed ? 'Expand sidebar' : 'Collapse sidebar'}</span>
        </button>
      </aside>
    </>
  )
}

function Nav({
  groups,
  activeId,
  collapsed,
  label,
  onNavigate,
}: {
  groups: AppSidebarGroup[]
  activeId?: string
  collapsed: boolean
  label: string
  onNavigate?: () => void
}) {
  return (
    <nav aria-label={label} className="flex flex-col gap-lg">
      {groups.map((g) => (
        <div key={g.id} className="flex flex-col gap-2xs">
          {g.label &&
            (collapsed ? (
              <span aria-hidden className="mx-md my-xs h-px bg-line" />
            ) : (
              <span className="px-lg pb-xs text-label uppercase text-muted tracking-label">{g.label}</span>
            ))}
          <ul aria-label={g.label} className="m-0 flex list-none flex-col gap-2xs p-0">
            {g.items.map((it) => (
              <li key={it.id} className="relative">
                <Item item={it} active={it.id === activeId} collapsed={collapsed} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function Item({ item, active, collapsed, onNavigate }: { item: AppSidebarItem; active: boolean; collapsed: boolean; onNavigate?: () => void }) {
  const cls = [
    'group relative flex w-full cursor-pointer items-center gap-md border-0 bg-transparent font-mono text-body no-underline transition-colors duration-fast',
    collapsed ? 'justify-center px-xs py-sm' : 'px-lg py-sm',
    active ? 'bg-canvas text-ink' : 'text-muted hover:bg-canvas hover:text-ink',
  ].join(' ')
  const body = (
    <>
      {active && <span aria-hidden className="absolute inset-y-xs left-none w-2xs rounded-full bg-sample-fill" />}
      <span aria-hidden className={['flex size-lg shrink-0 items-center justify-center', active ? 'text-sample' : ''].join(' ')}>
        {item.icon ?? <span className="text-caption">{item.label.charAt(0)}</span>}
      </span>
      <span className={collapsed ? 'sr-only' : 'min-w-0 flex-1 truncate text-left'}>{item.label}</span>
      {item.badge !== undefined &&
        (collapsed ? (
          <span className="absolute top-xs right-xs">
            <Badge label={String(item.badge)} tone={item.badgeTone ?? 'sample'} dot aria-label={`${item.badge} in ${item.label}`} />
          </span>
        ) : (
          <Badge label={String(item.badge)} tone={item.badgeTone ?? 'sample'} />
        ))}
      {collapsed && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-full z-20 ml-sm hidden whitespace-nowrap rounded-sm border border-line-strong bg-surface px-sm py-xs text-caption text-ink group-hover:block group-focus-visible:block"
        >
          {item.label}
        </span>
      )}
    </>
  )
  const onClick = () => {
    item.onSelect?.()
    onNavigate?.()
  }
  return item.href ? (
    <a href={item.href} aria-current={active ? 'page' : undefined} onClick={onClick} className={cls}>
      {body}
    </a>
  ) : (
    <button type="button" aria-current={active ? 'page' : undefined} onClick={onClick} className={cls}>
      {body}
    </button>
  )
}
