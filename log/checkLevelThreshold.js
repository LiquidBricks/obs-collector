import { PRECONDITION_INVALID } from '@liquid-bricks/lib-diagnostics/codes'
import { s } from '@liquid-bricks/lib-nats-subject/router'

const levelPriority = { error: 40, warn: 30, info: 20, debug: 10, trace: 5 }
const currentLogLevel = 'debug'

export function checkLevelThreshold({ scope: { level, [s.scope.ac]: abortCtl }, rootCtx: { diagnostics } }) {
  diagnostics.require(Object.keys(levelPriority).includes(level), PRECONDITION_INVALID, `Invalid log level: ${level}`, { level })

  levelPriority[level] < levelPriority[currentLogLevel] &&
    abortCtl.abort({ reason: 'log level below threshold', level, threshold: currentLogLevel })
}
