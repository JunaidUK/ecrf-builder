/**
 * Converts an age to a birthdate for FHIR search.
 * For minimum age, calculates the latest possible birthdate (today minus minAge years).
 * For maximum age, calculates the earliest possible birthdate (today minus maxAge+1 years + 1 day).
 */
export function ageToBirthdate(age: number, type: 'min' | 'max'): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  if (type === 'min') {
    // For minimum age constraint: birthdate must be <= (today - minAge years)
    const birthYear = year - age;
    const birthDate = new Date(birthYear, month, day);
    return formatDateForFhir(birthDate);
  }

  // For maximum age constraint: birthdate must be >= (today - (maxAge + 1) years + 1 day)
  const birthYear = year - age - 1;
  const birthDate = new Date(birthYear, month, day + 1);
  return formatDateForFhir(birthDate);
}

/**
 * Formats a Date object as YYYY-MM-DD for FHIR date parameters.
 */
export function formatDateForFhir(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets today's date formatted for FHIR.
 */
export function getTodayForFhir(): string {
  return formatDateForFhir(new Date());
}
