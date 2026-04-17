/**
 * 生年月日から生後日数を計算する
 */
export function getDaysOld(birthday: string, now: Date = new Date()): number {
  const birth = new Date(birthday + 'T00:00:00')
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffMs = today.getTime() - birth.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * 生年月日から「〇歳〇ヶ月」を計算する
 */
export function getAgeText(birthday: string, now: Date = new Date()): string {
  const birth = new Date(birthday + 'T00:00:00')
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  let years = today.getFullYear() - birth.getFullYear()
  let months = today.getMonth() - birth.getMonth()

  if (today.getDate() < birth.getDate()) {
    months--
  }
  if (months < 0) {
    years--
    months += 12
  }

  if (years === 0) {
    return `生後${months}ヶ月`
  }
  return `${years}歳${months}ヶ月`
}

/**
 * 生年月日から表示用テキストを返す
 * 生後365日未満: 「生後〇日」、それ以降: 「〇歳〇ヶ月」
 */
export function getAgeDisplay(birthday: string, now: Date = new Date()): string {
  const days = getDaysOld(birthday, now)
  if (days < 365) {
    return `生後${days}日`
  }
  return getAgeText(birthday, now)
}
