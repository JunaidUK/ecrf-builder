import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  searchConcepts,
  searchConditions,
  getICD10Mappings,
  searchConditionsWithICD10,
} from './terminology-client';

describe('terminology-client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('searchConcepts', () => {
    it('should return empty array for short search terms', async () => {
      const result = await searchConcepts('a');
      expect(result).toEqual([]);
    });

    it('should search for concepts by term', async () => {
      const mockConcepts = {
        items: [
          {
            conceptId: '38341003',
            fsn: { term: 'Hypertensive disorder (disorder)' },
            pt: { term: 'Hypertension' },
            active: true,
          },
        ],
        total: 1,
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockConcepts),
      }));

      const result = await searchConcepts('hypertension');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/MAIN/concepts?term=hypertension'),
        expect.any(Object)
      );
      expect(result).toHaveLength(1);
      expect(result[0].conceptId).toBe('38341003');
    });

    it('should throw error on server error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      }));

      await expect(searchConcepts('diabetes')).rejects.toThrow(
        'Snowstorm error: Internal Server Error'
      );
    });
  });

  describe('searchConditions', () => {
    it('should search with clinical finding ECL filter', async () => {
      const mockConcepts = {
        items: [
          {
            conceptId: '73211009',
            fsn: { term: 'Diabetes mellitus (disorder)' },
            pt: { term: 'Diabetes mellitus' },
            active: true,
          },
        ],
        total: 1,
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockConcepts),
      }));

      const result = await searchConditions('diabetes');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('ecl='),
        expect.any(Object)
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('getICD10Mappings', () => {
    it('should get ICD-10 mappings for a concept', async () => {
      const mockMappings = {
        items: [
          {
            referencedComponentId: '38341003',
            additionalFields: {
              mapTarget: 'I10',
              mapGroup: 1,
              mapPriority: 1,
            },
          },
        ],
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockMappings),
      }));

      const result = await getICD10Mappings('38341003');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('referencedComponentId=38341003'),
        expect.any(Object)
      );
      expect(result).toHaveLength(1);
      expect(result[0].mapTarget).toBe('I10');
    });

    it('should handle empty mappings', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      }));

      const result = await getICD10Mappings('12345');
      expect(result).toEqual([]);
    });
  });

  describe('searchConditionsWithICD10', () => {
    it('should combine concept search with ICD-10 mappings', async () => {
      const mockConcepts = {
        items: [
          {
            conceptId: '38341003',
            fsn: { term: 'Hypertensive disorder' },
            pt: { term: 'Hypertension' },
            active: true,
          },
        ],
        total: 1,
      };

      const mockMappings = {
        items: [
          {
            referencedComponentId: '38341003',
            additionalFields: {
              mapTarget: 'I10',
              mapGroup: 1,
              mapPriority: 1,
            },
          },
        ],
      };

      let callCount = 0;
      vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockConcepts),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMappings),
        });
      }));

      const result = await searchConditionsWithICD10('hypertension');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        snomedCode: '38341003',
        snomedDisplay: 'Hypertension',
        icd10Code: 'I10',
      });
    });

    it('should filter out concepts without ICD-10 mappings', async () => {
      const mockConcepts = {
        items: [
          {
            conceptId: '12345',
            fsn: { term: 'Some condition' },
            pt: { term: 'Some condition' },
            active: true,
          },
        ],
        total: 1,
      };

      let callCount = 0;
      vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockConcepts),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ items: [] }),
        });
      }));

      const result = await searchConditionsWithICD10('condition');

      expect(result).toHaveLength(0);
    });
  });
});
