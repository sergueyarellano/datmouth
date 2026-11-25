const isoRE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

export function isValidMessage (value) {
  return Boolean(value && value.type === 'chat' &&
    typeof value.timestamp === 'string' && isoRE.test(value.timestamp))
}
