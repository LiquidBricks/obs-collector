import { create as createTelemetrySubject } from '@liquid-bricks/lib-nats-subject/create/telemetry';
import { ackMessage } from '../middleware/ackMessage.js'
import { handler } from './handler.js'

export const path = createTelemetrySubject().trace().forSubscribe().toObject();
export const spec = {
  tokens: ['entity', 'version'],
  pre: [
  ],
  children: [
    [{ entity: '*' }, { handler }],
  ],
  post: [
    ackMessage,
  ]
}
