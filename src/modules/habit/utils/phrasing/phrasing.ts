import { SMALL_NUMBER_WORDS } from "./phrasing.constants";

export function describeClosedDay(completedCount: number): string {
  const word = SMALL_NUMBER_WORDS[completedCount] ?? String(completedCount);
  return `${word} for ${word.toLowerCase()}.`;
}

export function numberToWord(count: number): string {
  return SMALL_NUMBER_WORDS[count] ?? String(count);
}

export function describeHabitContinuity(missedCount: number, windowSize: number, justCompleted: boolean): string {
  const shownDays = windowSize + (justCompleted ? 1 : 0);
  if (missedCount === 0) {
    return `${numberToWord(shownDays)} DAYS UNBROKEN`;
  }
  return `${numberToWord(windowSize)} DAYS · ${numberToWord(missedCount)} MISSED`;
}
