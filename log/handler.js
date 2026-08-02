export function handler({ scope: { level, ts, attributes }, message }) {
  const time = (new Date(ts)).toLocaleTimeString()
  const out = `[${time}] ${level.toUpperCase()} ${attributes.msg}`
  // eslint-disable-next-line no-console
  console[level](message.subject, JSON.stringify({ out, attributes }, null, 2))
}
