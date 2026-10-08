'use client'

import { useCallback, useEffect, useId, useRef, useState, type ClipboardEvent, type KeyboardEvent, type ReactNode } from 'react'
import { FieldFrame, describedByOf, type FieldBaseProps } from './internal/d2-field'
import { escapeText, safeHref, sanitiseHtml } from './internal/d2-sanitise'

export type RichTextEditorProps = FieldBaseProps & {
  /** Starting content, as HTML. Sanitised to the formats the editor supports. */
  defaultValue?: string
  /** Shown while the editor is empty. */
  placeholder?: string
  /** Called with the sanitised HTML on every change. */
  onChange?: (html: string) => void
  /** Submitted with a form under this name, as HTML. */
  name?: string
  /** The editing area's minimum height, in lines of body text. */
  rows?: number
}

type Command = 'bold' | 'italic' | 'insertUnorderedList' | 'insertOrderedList'
type Block = 'p' | 'h2' | 'h3'

type ToolState = Record<Command, boolean> & { block: Block; link: boolean }
const EMPTY: ToolState = { bold: false, italic: false, insertUnorderedList: false, insertOrderedList: false, block: 'p', link: false }

const isMac = () => typeof navigator !== 'undefined' && /mac/i.test(navigator.platform)

/**
 * Formatted text for comments, notes and email templates: bold, italic, links, bulleted and
 * numbered lists, and two heading levels. Output is HTML, sanitised on the way in (paste and
 * defaultValue keep only those formats, so styles and scripts from Word or a web page never
 * arrive). The toolbar is one tab stop with Left and Right between its buttons (APG toolbar);
 * each format button shows its state with aria-pressed. Shortcuts: Ctrl or Cmd with B, I and
 * K (link), with Shift and 7 or 8 for numbered and bulleted lists. The link form opens in the
 * toolbar, not a browser dialog, and Escape closes it. The editing area is a multiline textbox
 * named by the label.
 */
export function RichTextEditor({
  label,
  hint,
  error,
  required = false,
  disabled = false,
  defaultValue = '',
  placeholder = 'Write something',
  onChange,
  name,
  rows = 6,
}: RichTextEditorProps) {
  const id = useId()
  const editor = useRef<HTMLDivElement>(null)
  const toolbar = useRef<HTMLDivElement>(null)
  const linkInput = useRef<HTMLInputElement>(null)
  const saved = useRef<Range | null>(null)
  const [html, setHtml] = useState('')
  const [empty, setEmpty] = useState(true)
  const [state, setState] = useState<ToolState>(EMPTY)
  const [linking, setLinking] = useState(false)
  const [href, setHref] = useState('')
  const [focusIndex, setFocusIndex] = useState(0)

  // Sanitise the starting HTML once, in the browser.
  useEffect(() => {
    if (!editor.current) return
    editor.current.innerHTML = sanitiseHtml(defaultValue)
    sync()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sync = useCallback(() => {
    const el = editor.current
    if (!el) return
    const out = sanitiseHtml(el.innerHTML)
    setHtml(out)
    setEmpty(!el.textContent?.trim() && !el.querySelector('li'))
    onChange?.(out)
  }, [onChange])

  const readState = useCallback(() => {
    const el = editor.current
    const sel = document.getSelection()
    if (!el || !sel?.anchorNode || !el.contains(sel.anchorNode)) return
    const blockRaw = String(document.queryCommandValue('formatBlock') || 'p').toLowerCase().replace(/[<>]/g, '')
    const anchor = sel.anchorNode.nodeType === 1 ? (sel.anchorNode as Element) : sel.anchorNode.parentElement
    setState({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      block: blockRaw === 'h2' || blockRaw === 'h3' ? blockRaw : 'p',
      link: !!anchor?.closest('a'),
    })
  }, [])

  useEffect(() => {
    document.addEventListener('selectionchange', readState)
    return () => document.removeEventListener('selectionchange', readState)
  }, [readState])

  const exec = (cmd: string, value?: string) => {
    editor.current?.focus()
    document.execCommand(cmd, false, value)
    readState()
    sync()
  }

  const setBlock = (b: Block) => exec('formatBlock', state.block === b && b !== 'p' ? 'p' : b)

  const openLink = () => {
    const sel = document.getSelection()
    if (sel?.rangeCount && editor.current?.contains(sel.anchorNode)) saved.current = sel.getRangeAt(0).cloneRange()
    const anchor = sel?.anchorNode?.parentElement?.closest('a')
    setHref(anchor?.getAttribute('href') ?? '')
    setLinking(true)
    requestAnimationFrame(() => linkInput.current?.focus())
  }
  const restore = () => {
    const sel = document.getSelection()
    if (saved.current && sel) {
      editor.current?.focus()
      sel.removeAllRanges()
      sel.addRange(saved.current)
    }
  }
  const applyLink = () => {
    const safe = safeHref(href)
    restore()
    if (safe) {
      if (document.getSelection()?.isCollapsed) {
        const a = `<a href="${safe.replace(/"/g, '&quot;')}">${safe.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</a>`
        document.execCommand('insertHTML', false, a)
      } else document.execCommand('createLink', false, safe)
    }
    setLinking(false)
    readState()
    sync()
  }
  const removeLink = () => {
    restore()
    document.execCommand('unlink')
    setLinking(false)
    readState()
    sync()
  }

  const onPaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const rich = e.clipboardData.getData('text/html')
    const clean = rich ? sanitiseHtml(rich) : escapeText(e.clipboardData.getData('text/plain'))
    document.execCommand('insertHTML', false, clean)
    sync()
  }

  const onEditorKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const mod = isMac() ? e.metaKey : e.ctrlKey
    if (!mod) return
    const k = e.key.toLowerCase()
    if (k === 'k') {
      e.preventDefault()
      openLink()
    } else if (e.shiftKey && (k === '7' || k === '&')) {
      e.preventDefault()
      exec('insertOrderedList')
    } else if (e.shiftKey && (k === '8' || k === '*')) {
      e.preventDefault()
      exec('insertUnorderedList')
    } else if (k === 'b' || k === 'i') {
      // The browser applies these itself; refresh the toolbar afterwards.
      requestAnimationFrame(() => {
        readState()
        sync()
      })
    }
  }

  // APG toolbar: one tab stop, arrows move between buttons.
  const onToolbarKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const buttons = [...(toolbar.current?.querySelectorAll<HTMLButtonElement>('button[data-tool]') ?? [])]
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement)
    if (i < 0) return
    const to =
      e.key === 'ArrowRight' ? (i + 1) % buttons.length
      : e.key === 'ArrowLeft' ? (i - 1 + buttons.length) % buttons.length
      : e.key === 'Home' ? 0
      : e.key === 'End' ? buttons.length - 1
      : null
    if (to === null) return
    e.preventDefault()
    setFocusIndex(to)
    buttons[to].focus()
  }

  const mod = isMac() ? 'Cmd' : 'Ctrl'
  let index = 0
  const tool = (key: string, labelText: string, pressed: boolean, onPress: () => void, glyph: ReactNode, shortcut?: string) => {
    const i = index++
    return (
      <button
        key={key}
        type="button"
        data-tool={key}
        aria-label={labelText}
        aria-pressed={pressed}
        aria-keyshortcuts={shortcut}
        title={shortcut ? `${labelText} (${shortcut.replace('Control', mod).replace('Meta', mod)})` : labelText}
        tabIndex={i === focusIndex ? 0 : -1}
        disabled={disabled}
        // Keep the editor's selection when a toolbar button is clicked.
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          setFocusIndex(i)
          onPress()
        }}
        className={[
          'flex h-2xl min-w-2xl cursor-pointer items-center justify-center rounded-sm border-0 px-xs font-mono text-caption transition-colors duration-fast',
          'disabled:cursor-not-allowed disabled:bg-transparent disabled:text-disabled',
          pressed ? 'bg-canvas text-sample' : 'bg-transparent text-muted hover:bg-canvas hover:text-ink',
        ].join(' ')}
      >
        {glyph}
      </button>
    )
  }
  const sep = (k: string) => <span key={k} aria-hidden className="mx-2xs h-lg w-px bg-line" />
  const ico = (d: string) => (
    <svg aria-hidden viewBox="0 0 16 16" className="size-md">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
  const keyShortcut = isMac() ? 'Meta' : 'Control'

  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} required={required}>
      <div
        className={[
          'flex w-full min-w-0 flex-col rounded-sm border transition-colors duration-fast',
          disabled ? 'border-disabled' : error ? 'border-danger bg-surface' : 'border-line-interactive bg-surface has-[:focus-visible]:border-sample',
        ].join(' ')}
      >
        <div
          ref={toolbar}
          role="toolbar"
          aria-label={`${label} formatting`}
          aria-controls={`${id}-editor`}
          onKeyDown={onToolbarKey}
          className="flex flex-wrap items-center gap-2xs border-b border-line px-xs py-xs"
        >
          {tool('p', 'Body text', state.block === 'p' && !state.insertOrderedList && !state.insertUnorderedList, () => setBlock('p'), <span>Aa</span>)}
          {tool('h2', 'Heading', state.block === 'h2', () => setBlock('h2'), <span>H2</span>)}
          {tool('h3', 'Subheading', state.block === 'h3', () => setBlock('h3'), <span>H3</span>)}
          {sep('s1')}
          {tool('bold', 'Bold', state.bold, () => exec('bold'), <span className="font-bold">B</span>, `${keyShortcut}+B`)}
          {tool('italic', 'Italic', state.italic, () => exec('italic'), <span className="italic">I</span>, `${keyShortcut}+I`)}
          {tool('link', 'Link', state.link, openLink, ico('M7 9.5a2.5 2.5 0 003.5 0l2-2a2.5 2.5 0 00-3.5-3.5l-.5.5M9 6.5a2.5 2.5 0 00-3.5 0l-2 2A2.5 2.5 0 007 12l.5-.5'), `${keyShortcut}+K`)}
          {sep('s2')}
          {tool('ul', 'Bulleted list', state.insertUnorderedList, () => exec('insertUnorderedList'), ico('M6 4h7M6 8h7M6 12h7M3 4h.5M3 8h.5M3 12h.5'), `${keyShortcut}+Shift+8`)}
          {tool('ol', 'Numbered list', state.insertOrderedList, () => exec('insertOrderedList'), ico('M6 4h7M6 8h7M6 12h7M2.5 3l1-.5V6M2.5 9.5h1.5L2.5 12h1.5'), `${keyShortcut}+Shift+7`)}
        </div>

        {linking && (
          <div
            className="flex flex-wrap items-center gap-sm border-b border-line bg-canvas px-md py-sm"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                setLinking(false)
                restore()
              }
            }}
          >
            <label htmlFor={`${id}-href`} className="text-label uppercase text-muted tracking-label">
              Link address
            </label>
            <input
              ref={linkInput}
              id={`${id}-href`}
              type="url"
              value={href}
              placeholder="https://"
              onChange={(e) => setHref(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  applyLink()
                }
              }}
              className="min-w-0 flex-1 rounded-sm border border-line-interactive bg-surface px-md py-xs font-mono text-caption text-ink outline-none focus-visible:border-sample"
            />
            <button type="button" onClick={applyLink} className="cursor-pointer rounded-sm border border-line-interactive bg-transparent px-md py-xs font-mono text-caption text-ink hover:bg-surface">
              Apply
            </button>
            {state.link && (
              <button type="button" onClick={removeLink} className="cursor-pointer rounded-sm border-0 bg-transparent px-md py-xs font-mono text-caption text-muted hover:text-ink">
                Remove link
              </button>
            )}
          </div>
        )}

        <div className="relative">
          {empty && (
            <span aria-hidden className={['pointer-events-none absolute top-md left-lg font-text text-body', disabled ? 'text-disabled' : 'text-muted'].join(' ')}>
              {placeholder}
            </span>
          )}
          <div
            ref={editor}
            id={`${id}-editor`}
            role="textbox"
            aria-multiline
            aria-labelledby={`${id}-label`}
            aria-describedby={describedByOf(id, error, hint)}
            aria-required={required || undefined}
            aria-invalid={error ? true : undefined}
            aria-disabled={disabled || undefined}
            aria-placeholder={placeholder}
            contentEditable={!disabled}
            suppressContentEditableWarning
            tabIndex={disabled ? -1 : 0}
            onInput={sync}
            onPaste={onPaste}
            onKeyDown={onEditorKey}
            onKeyUp={readState}
            onMouseUp={readState}
            className={[
              'px-lg py-md font-text text-body leading-relaxed outline-none',
              disabled ? 'cursor-not-allowed text-disabled [&_a]:text-disabled' : 'text-ink [&_a]:text-sample',
              '[&_a]:underline [&_a]:underline-offset-4',
              '[&_h2]:m-0 [&_h2]:mb-sm [&_h2]:font-mono [&_h2]:text-body-lg [&_h2]:font-medium',
              '[&_h3]:m-0 [&_h3]:mb-xs [&_h3]:font-mono [&_h3]:text-body [&_h3]:font-medium',
              '[&_p]:m-0 [&_p+p]:mt-sm [&_ul]:my-sm [&_ul]:list-disc [&_ul]:pl-xl [&_ol]:my-sm [&_ol]:list-decimal [&_ol]:pl-xl',
            ].join(' ')}
            style={{ minHeight: `calc(${rows} * 1.625em + 2 * var(--spacing-md))` }}
          />
        </div>
      </div>
      {name && <input type="hidden" name={name} value={html} />}
    </FieldFrame>
  )
}
