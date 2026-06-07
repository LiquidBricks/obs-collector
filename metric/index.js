import { create as createTelemetrySubject } from '@liquid-bricks/lib-nats-subject/create/telemetry';
export const path = createTelemetrySubject().metric().forSubscribe().toObject();
export const spec = {
  tokens: ['entity', 'version'],
  pre: [
  ],
  children: [
    [{ entity: 'counter' }, { handler: () => { console.log('counter') } }],
    [{ entity: 'histogram' }, { handler: () => { console.log('histogram') } }],
  ],
  post: [
    ackMessage,
  ]
}

// post middlewares
function ackMessage({ message }) { message.ack() }
