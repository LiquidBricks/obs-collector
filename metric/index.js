import { create as createTelemetrySubject } from '@liquid-bricks/lib-nats-subject/create/telemetry';
import { ackMessage } from '../middleware/ackMessage.js'
import { handleCounter } from './handleCounter.js'
import { handleHistogram } from './handleHistogram.js'

export const path = createTelemetrySubject().metric().forSubscribe().toObject();
export const spec = {
  tokens: ['entity', 'version'],
  pre: [
  ],
  children: [
    [{ entity: 'counter' }, { handler: handleCounter }],
    [{ entity: 'histogram' }, { handler: handleHistogram }],
  ],
  post: [
    ackMessage,
  ]
}
