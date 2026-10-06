export type StepperOrientation = 'horizontal' | 'vertical'

export type StepperStep = {
  id: string
  /** Sentence case, a noun or a short verb phrase: "Account", "Choose a plan". */
  label: string
  /** One line under the label. Vertical only. */
  description?: string
}

export type StepperProps = {
  /** The steps, in order. Content, not a Figma property: the library shows four. */
  steps: StepperStep[]
  /** The index of the current step, counting from 0. Earlier steps are complete. */
  current: number
  /** horizontal across the top of a form, vertical beside a longer flow. */
  orientation?: StepperOrientation
}

type State = 'complete' | 'current' | 'upcoming'

/**
 * Shows where someone is in a multi-step flow: which steps are done, which one they are on,
 * and what is left. State never rests on colour alone: a complete step shows a tick, the
 * current step a filled dot and aria-current="step", and each item carries its state as
 * visually hidden text.
 */
export function Stepper({ steps, current, orientation = 'horizontal' }: StepperProps) {
  const vertical = orientation === 'vertical'
  const stateOf = (i: number): State => (i < current ? 'complete' : i === current ? 'current' : 'upcoming')

  return (
    <ol className={['m-0 flex list-none p-0', vertical ? 'flex-col gap-xl' : 'flex-col gap-md sm:flex-row sm:items-center'].join(' ')}>
      {steps.map((step, i) => {
        const state = stateOf(i)
        return (
          // Horizontal steps share the row and the connector stretches to fill it, so the line
          // always joins two steps; below sm the steps stack and the connectors drop out.
          <li
            key={step.id}
            aria-current={state === 'current' ? 'step' : undefined}
            className={['flex items-start gap-md', !vertical && i < steps.length - 1 && 'sm:flex-1 sm:items-center'].filter(Boolean).join(' ')}
          >
            <span
              aria-hidden
              className={[
                !vertical ? 'mt-2xs sm:mt-none' : 'mt-2xs', 'flex size-lg shrink-0 items-center justify-center rounded-full border font-mono text-micro',
                state === 'complete' && 'border-sample-fill bg-sample-fill text-on-sample',
                state === 'current' && 'border-sample-fill bg-transparent text-sample',
                state === 'upcoming' && 'border-line-interactive bg-transparent text-muted',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {state === 'complete' ? '✓' : state === 'current' ? <span className="size-xs rounded-full bg-sample-fill" /> : i + 1}
            </span>
            <span className="flex flex-col gap-2xs">
              <span className={['text-body', !vertical && 'whitespace-nowrap', state === 'upcoming' ? 'text-muted' : 'text-ink'].join(' ')}>
                {step.label}
                <span className="sr-only">
                  {state === 'complete' ? ', complete' : state === 'current' ? ', current step' : ', not started'}
                </span>
              </span>
              {vertical && step.description && (
                <span className="font-text text-caption leading-normal text-muted">{step.description}</span>
              )}
            </span>
            {!vertical && i < steps.length - 1 && <span aria-hidden className="hidden min-w-lg flex-1 border-t border-line sm:block" />}
          </li>
        )
      })}
    </ol>
  )
}
