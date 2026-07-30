import { AckPolicy, DeliverPolicy } from "@nats-io/jetstream";
import { router, s } from "@liquid-bricks/lib-nats-subject/router";
import { diagnostics as diagnosticsSubjectFactory } from '@liquid-bricks/lib-nats-subject'
import { events as natsEvents } from '@liquid-bricks/lib-nats-subject/events/nats'
import { ROUTER_UNKNOWN_SUBJECT } from '@liquid-bricks/lib-diagnostics/codes'
import * as log from './log/index.js'
import * as metric from './metric/index.js'
import * as trace from './trace/index.js'

export const routes = [
  [log.path, log.spec],
  [metric.path, metric.spec],
  [trace.path, trace.spec],
]

const consumerName = 'logsConsumer'
export async function collector({ streamName, natsContext, diagnostics: d }) {
  const diagnostics = d.child({ consumerName })

  const jetstream = await natsContext.jetstream();
  const jetstreamManager = await natsContext.jetstreamManager()

  // Ensure a clean slate: delete existing consumer if present
  try {
    await jetstreamManager.consumers.delete(streamName, consumerName)
  } catch (_) { /* ignore if not found or unsupported */ }

  await jetstreamManager.consumers.add(streamName, {
    durable_name: consumerName,
    ack_policy: AckPolicy.Explicit,
    deliver_policy: DeliverPolicy.All,
    filter_subjects: [
      diagnosticsSubjectFactory.create(natsEvents.tele['>']).forSubscribe().build(),
      diagnosticsSubjectFactory.create(natsEvents.metrics['>']).forSubscribe().build(),
    ],
  });

  const c = await jetstream.consumers.get(streamName, consumerName);
  const iter = await c.consume();

  const r = router({
    tokens: ['telemetryNS', 'channel'],
    context: { natsContext, diagnostics }
  })
    .abort(({ reason, stage, message, rootCtx: { diagnostics } }) => {
      try { message?.ack?.() } catch (_) { /* ignore */ }
      diagnostics?.debug?.('diagnostics router aborted', { stage, reason })
      return { status: 'aborted' }
    })
    .route({}, { children: routes })
    .default({
      handler: async ({ message, rootCtx: { diagnostics } }) => {
        diagnostics.invariant(
          message?.term?.(`No handler for subject: ${message.subject}`) ?? false,
          ROUTER_UNKNOWN_SUBJECT,
          `No handler for subject: ${message.subject}`,
          { subject: message.subject, message: message?.json?.() }
        )
      }
    })
    .error(({ error, message }) => {
      message.term()
      // eslint-disable-next-line no-console
      console.log('diagnostics consumer error', error, message.json())
    })

  new Promise(async () => {
    for await (const m of iter) {
      await r.request({ subject: m.subject, message: m })
    }
  })
}