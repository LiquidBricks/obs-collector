export function decodeLogPayload({ message }) {
  const { ts, level, attributes, kind } = message.json()
  return { ts, level, attributes, kind }
}
