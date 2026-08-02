import { PRECONDITION_INVALID, PRECONDITION_REQUIRED } from '@liquid-bricks/lib-diagnostics/codes'

export function validateData({ scope: { ts, level, attributes, kind }, message, rootCtx: { diagnostics } }) {
  diagnostics.invariant(kind === 'log', PRECONDITION_INVALID, `Invalid telemetry kind: ${kind}`, { kind, subject: message.subject })
  diagnostics.require(level, PRECONDITION_REQUIRED, 'Log level is required', { field: 'level', subject: message.subject })
  diagnostics.require(ts, PRECONDITION_REQUIRED, 'Log timestamp is required', { field: 'ts', subject: message.subject })
  diagnostics.require(attributes, PRECONDITION_REQUIRED, 'Log attributes are required', { field: 'attributes', subject: message.subject })
  diagnostics.require(attributes.msg, PRECONDITION_REQUIRED, 'Log message is required', { field: 'message', subject: message.subject })
  diagnostics.require(attributes.meta, PRECONDITION_REQUIRED, 'Log info is required', { field: 'info', subject: message.subject })
}
