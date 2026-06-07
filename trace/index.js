import { create as createTelemetrySubject } from '@liquid-bricks/lib-nats-subject/create/telemetry';
export const path = createTelemetrySubject().trace().forSubscribe().toObject();
export const spec = {
  tokens: ['entity', 'version'],
  pre: [
  ],
  children: [
    [{ entity: '*' }, { handler: () => { console.log('trace *') } }],
  ],
  post: [
    ackMessage,
  ]
}

// post middlewares
function ackMessage({ message }) { message.ack() }
