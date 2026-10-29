import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, SessionContextUsage } from 'claude-code'

import type { Fill } from '../types'

const fill = atom({ plugin: 'contexto', key: 'fill' } as const, null)

const toFill = (c: SessionContextUsage): Fill | null =>
  c.tokens === undefined
    ? null
    : { tokens: c.tokens, window: c.window, percent: c.percent ?? 0, isEstimate: false }

// Before the first response since the chat opened there is no live reading:
// estimate from the transcript as /context does, without any API request.
const estimate = async ($: EngineInterface): Promise<Fill | null> => {
  const { context } = await $.session.usage({ breakdown: 'summary' })
  const b = context.breakdown
  if (b === undefined) {
    return null
  }
  return { tokens: b.totalTokens, window: b.rawMaxTokens, percent: b.percentage, isEstimate: true }
}

const label = (f: Fill) =>
  `Contexto: ${f.isEstimate ? '~' : ''}${f.percent}% · ${Math.round(f.tokens / 1000)}k de ${Math.round(f.window / 1000)}k`

const show = async ($: EngineInterface, f: Fill | null) => {
  await update($, fill, () => f)
  $.ui.status(f ? label(f) : undefined)
}

let hasTriedEstimate = false

const refresh = async ($: EngineInterface) => {
  const { context } = await $.session.usage()
  const live = toFill(context)
  if (live !== null) {
    await show($, live)
    return
  }
  if (!hasTriedEstimate) {
    hasTriedEstimate = true
    await show($, await estimate($))
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    await refresh($)
    return result
  })

  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('context')) {
      const live = toFill(e.context)
      if (live !== null) {
        await show($, live)
      }
    }
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    let f = await read($, fill)
    if (f === null && !hasTriedEstimate) {
      await refresh($)
      f = await read($, fill)
    }
    if (e.props.hasSurvey || f === null) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)
    const color = f.percent >= 80 ? 'red' : f.percent >= 50 ? 'yellow' : undefined

    return (
      <Box>
        <Text color={color} dimColor={color === undefined}>
          {label(f)}
        </Text>
      </Box>
    )
  })
}
