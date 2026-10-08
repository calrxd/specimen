/*
 * Shared sizes for the Pro popup lists (AutoComplete, MultiSelect, TreeSelect), so every list
 * that drops from a field stops at the same height. 18rem has no spacing token: it shows about
 * seven 40px options, enough to scan before scrolling, and is the same in every list.
 */
export const LISTBOX_MAX_H = 'max-h-[18rem]'

/**
 * The keyboard highlight on an option: canvas fill and a 2px sample bar on the leading edge,
 * drawn as a token border so the system stays flat. The transparent bar at rest keeps the
 * text from shifting when the highlight moves.
 */
export const optionBar = (active: boolean) => (active ? 'border-l-strong border-l-sample bg-canvas' : 'border-l-strong border-l-transparent')
