export const formatDate = (dateInput: Date | string | number): string => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)

  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }

  const day = date.getUTCDate() < 10 ? `0${date.getUTCDate()}` : `${date.getUTCDate()}`
  const month =
    date.getUTCMonth() + 1 < 10 ? `0${date.getUTCMonth() + 1}` : `${date.getUTCMonth() + 1}`
  const year = date.getUTCFullYear()

  return `${day}/${month}/${year}`
}

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
