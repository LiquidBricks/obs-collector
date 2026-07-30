import { create as createTelemetrySubject } from '@liquid-bricks/lib-nats-subject/create/telemetry';
import { s } from "@liquid-bricks/lib-nats-subject/router";
import { PRECONDITION_INVALID, PRECONDITION_REQUIRED } from '@liquid-bricks/lib-diagnostics/codes'

const levelPriority = { error: 40, warn: 30, info: 20, debug: 10, trace: 5 };
const currentLogLevel = 'debug';

export const path = createTelemetrySubject().log().forSubscribe().toObject();
export const spec = {
  tokens: ['version'],
  decode: [
    decodeLogPayload,
  ],
  pre: [
    validateData,
    checkLevelThreshold,
  ],
  handler,
  post: [
    ackMessage,
  ]
}

// decode middleware
function decodeLogPayload({ message }) {
  const { ts, level, attributes, kind } = message.json()
  return { ts, level, attributes, kind }
}

// pre middlewares
function validateData({ scope: { ts, level, attributes, kind }, message, rootCtx: { diagnostics } }) {
  diagnostics.invariant(kind === 'log', PRECONDITION_INVALID, `Invalid telemetry kind: ${kind}`, { kind, subject: message.subject })
  diagnostics.require(level, PRECONDITION_REQUIRED, 'Log level is required', { field: 'level', subject: message.subject })
  diagnostics.require(ts, PRECONDITION_REQUIRED, 'Log timestamp is required', { field: 'ts', subject: message.subject })
  diagnostics.require(attributes, PRECONDITION_REQUIRED, 'Log attributes are required', { field: 'attributes', subject: message.subject })
  diagnostics.require(attributes.msg, PRECONDITION_REQUIRED, 'Log message is required', { field: 'message', subject: message.subject })
  diagnostics.require(attributes.meta, PRECONDITION_REQUIRED, 'Log info is required', { field: 'info', subject: message.subject })
}

function checkLevelThreshold({ scope: { level, [s.scope.ac]: abortCtl }, rootCtx: { diagnostics } }) {
  diagnostics.require(Object.keys(levelPriority).includes(level), PRECONDITION_INVALID, `Invalid log level: ${level}`, { level })

  levelPriority[level] < levelPriority[currentLogLevel] &&
    abortCtl.abort({ reason: 'log level below threshold', level, threshold: currentLogLevel })
}

// handler
function handler({ scope: { level, ts, attributes }, message }) {

  const time = (new Date(ts)).toLocaleTimeString()
  const out = `[${time}] ${level.toUpperCase()} ${attributes.msg}`
  // eslint-disable-next-line no-console
  console[level](message.subject, JSON.stringify({ out, attributes }, null, 2))
}

// post middlewares
function ackMessage({ message }) { message.ack() }
