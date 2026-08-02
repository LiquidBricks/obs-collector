import { create as createTelemetrySubject } from '@liquid-bricks/lib-nats-subject/create/telemetry';
import { ackMessage } from '../middleware/ackMessage.js'
import { checkLevelThreshold } from './checkLevelThreshold.js'
import { decodeLogPayload } from './decodeLogPayload.js'
import { handler } from './handler.js'
import { validateData } from './validateData.js'

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
