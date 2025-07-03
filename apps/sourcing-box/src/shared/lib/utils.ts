import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ko-KR').format(date)
} 