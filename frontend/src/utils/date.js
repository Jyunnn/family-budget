export const padNumber = (value) => String(value).padStart(2, '0')

export const formatDate = (date) => {
  const year = date.getFullYear()
  const month = padNumber(date.getMonth() + 1)
  const day = padNumber(date.getDate())
  return `${year}-${month}-${day}`
}

export const formatMonth = (date) => {
  const year = date.getFullYear()
  const month = padNumber(date.getMonth() + 1)
  return `${year}-${month}`
}

export const parseMonth = (value) => {
  const [year, month] = value.split('-').map(Number)
  return { year, month: month - 1 }
}

export const addMonths = (date, delta) => {
  const next = new Date(date)
  next.setMonth(next.getMonth() + delta)
  return next
}

export const getQuarter = (monthIndex) => Math.floor(monthIndex / 3) + 1
