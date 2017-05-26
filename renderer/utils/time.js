export const calcTime = (time) => {
  const totalSeconds = time
  const minutes = (totalSeconds / 60) >> 0
  const seconds = totalSeconds % 60
  return [minutes, seconds].map(value =>
    String(value < 10 ? '0' + value : value)).join(':')
}