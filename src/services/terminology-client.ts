const SNOWSTORM_BASE_URL = import.meta.env.VITE_SNOWSTORM_BASE_URL || '/snowstorm';

export interface SnomedConcept {
  conceptId: string;
  fsn: {
    term: string;
  };
  pt: {
    term: string;
  };
  active: boolean;
}

export interface ICD10Mapping {
  referencedComponentId: string;
  mapTarget: string;
  mapGroup: number;
  mapPriority: number;
  mapRule?: string;
  mapAdvice?: string;
}

export interface ConceptSearchResult {
  items: SnomedConcept[];
  total: number;
}

export interface ICD10SearchResult {
  snomedCode: string;
  snomedDisplay: string;
  icd10Code: string;
  icd10Display?: string;
}

/**
 * Search for SNOMED CT concepts by term
 */
export async function searchConcepts(
  term: string,
  limit: number = 20
): Promise<SnomedConcept[]> {
  if (!term || term.length < 2) {
    return [];
  }

  const encodedTerm = encodeURIComponent(term);
  const url = `${SNOWSTORM_BASE_URL}/MAIN/concepts?term=${encodedTerm}&activeFilter=true&limit=${limit}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      'Accept-Language': 'en',
    },
  });

  if (!response.ok) {
    throw new Error(`Snowstorm error: ${response.statusText}`);
  }

  const data: ConceptSearchResult = await response.json();
  return data.items || [];
}

/**
 * Search for clinical findings (disorders/conditions) by term
 * Uses the ECL (Expression Constraint Language) to filter to clinical findings
 */
export async function searchConditions(
  term: string,
  limit: number = 20
): Promise<SnomedConcept[]> {
  if (!term || term.length < 2) {
    return [];
  }

  const encodedTerm = encodeURIComponent(term);
  // ECL for clinical findings: << 404684003 |Clinical finding|
  const ecl = encodeURIComponent('<< 404684003');
  const url = `${SNOWSTORM_BASE_URL}/MAIN/concepts?term=${encodedTerm}&ecl=${ecl}&activeFilter=true&limit=${limit}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      'Accept-Language': 'en',
    },
  });

  if (!response.ok) {
    throw new Error(`Snowstorm error: ${response.statusText}`);
  }

  const data: ConceptSearchResult = await response.json();
  return data.items || [];
}

/**
 * Get ICD-10 mappings for a SNOMED CT concept
 * Uses the ICD-10 simple map refset (447562003)
 */
export async function getICD10Mappings(
  snomedConceptId: string
): Promise<ICD10Mapping[]> {
  // ICD-10 complex map refset ID
  const icd10RefsetId = '447562003';
  const url = `${SNOWSTORM_BASE_URL}/MAIN/members?referenceSet=${icd10RefsetId}&referencedComponentId=${snomedConceptId}&active=true&limit=50`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  if (!response.ok) {
    throw new Error(`Snowstorm error: ${response.statusText}`);
  }

  const data = await response.json();
  return (data.items || []).map((item: Record<string, unknown>) => ({
    referencedComponentId: item.referencedComponentId as string,
    mapTarget: (item.additionalFields as Record<string, string>)?.mapTarget || '',
    mapGroup: (item.additionalFields as Record<string, number>)?.mapGroup || 1,
    mapPriority: (item.additionalFields as Record<string, number>)?.mapPriority || 1,
    mapRule: (item.additionalFields as Record<string, string>)?.mapRule,
    mapAdvice: (item.additionalFields as Record<string, string>)?.mapAdvice,
  }));
}

/**
 * Search for conditions and get their ICD-10 mappings in one call
 */
export async function searchConditionsWithICD10(
  term: string,
  limit: number = 10
): Promise<ICD10SearchResult[]> {
  const concepts = await searchConditions(term, limit);
  const results: ICD10SearchResult[] = [];

  for (const concept of concepts) {
    const mappings = await getICD10Mappings(concept.conceptId);

    if (mappings.length > 0) {
      // Get unique ICD-10 codes for this concept
      const uniqueCodes = new Set<string>();
      for (const mapping of mappings) {
        if (mapping.mapTarget && !uniqueCodes.has(mapping.mapTarget)) {
          uniqueCodes.add(mapping.mapTarget);
          results.push({
            snomedCode: concept.conceptId,
            snomedDisplay: concept.pt.term,
            icd10Code: mapping.mapTarget,
          });
        }
      }
    }
  }

  return results;
}

/**
 * Direct ICD-10 code search by code prefix
 * Searches for SNOMED concepts that map to ICD-10 codes starting with the given prefix
 */
export async function searchByICD10Code(
  codePrefix: string,
  limit: number = 20
): Promise<ICD10SearchResult[]> {
  if (!codePrefix || codePrefix.length < 1) {
    return [];
  }

  // Search for refset members where mapTarget starts with the code prefix
  const icd10RefsetId = '447562003';
  const url = `${SNOWSTORM_BASE_URL}/MAIN/members?referenceSet=${icd10RefsetId}&active=true&limit=${limit}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  if (!response.ok) {
    throw new Error(`Snowstorm error: ${response.statusText}`);
  }

  const data = await response.json();
  const results: ICD10SearchResult[] = [];
  const seenCodes = new Set<string>();
  const upperPrefix = codePrefix.toUpperCase();

  for (const item of data.items || []) {
    const mapTarget = (item.additionalFields as Record<string, string>)?.mapTarget || '';
    if (mapTarget.toUpperCase().startsWith(upperPrefix) && !seenCodes.has(mapTarget)) {
      seenCodes.add(mapTarget);
      results.push({
        snomedCode: item.referencedComponentId as string,
        snomedDisplay: '', // Would need another call to get this
        icd10Code: mapTarget,
      });
    }
  }

  return results;
}
