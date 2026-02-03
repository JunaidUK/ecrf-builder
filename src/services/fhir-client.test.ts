import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  searchPatients,
  executeQuery,
  getPatientConditions,
  getPatientMedications,
  getPatientObservations,
  getPatientDetails,
} from './fhir-client';

describe('fhir-client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('searchPatients', () => {
    it('should fetch patients successfully', async () => {
      const mockBundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        total: 2,
        entry: [
          {
            resource: {
              resourceType: 'Patient',
              id: '1',
              name: [{ given: ['John'], family: 'Doe' }],
            },
          },
          {
            resource: {
              resourceType: 'Patient',
              id: '2',
              name: [{ given: ['Jane'], family: 'Smith' }],
            },
          },
        ],
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBundle),
      }));

      const result = await searchPatients('gender=female');

      expect(fetch).toHaveBeenCalledWith(
        '/fhir/Patient?gender=female&_count=100',
        expect.objectContaining({
          method: 'GET',
          headers: { Accept: 'application/fhir+json' },
        })
      );
      expect(result.patients).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should handle empty results', async () => {
      const mockBundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        total: 0,
        entry: [],
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBundle),
      }));

      const result = await searchPatients('');

      expect(result.patients).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should throw error on server error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      }));

      await expect(searchPatients('')).rejects.toMatchObject({
        message: 'FHIR server error: Internal Server Error',
        status: 500,
      });
    });

    it('should handle bundle without entry array', async () => {
      const mockBundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        total: 0,
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBundle),
      }));

      const result = await searchPatients('');

      expect(result.patients).toHaveLength(0);
    });
  });

  describe('executeQuery', () => {
    it('should extract query params from full query', async () => {
      const mockBundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        total: 1,
        entry: [
          {
            resource: {
              resourceType: 'Patient',
              id: '1',
            },
          },
        ],
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBundle),
      }));

      await executeQuery('/Patient?gender=male&birthdate=ge1990-01-01');

      expect(fetch).toHaveBeenCalledWith(
        '/fhir/Patient?gender=male&birthdate=ge1990-01-01&_count=100',
        expect.any(Object)
      );
    });

    it('should handle query without params', async () => {
      const mockBundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        total: 0,
        entry: [],
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBundle),
      }));

      await executeQuery('/Patient');

      expect(fetch).toHaveBeenCalledWith(
        '/fhir/Patient?_count=100',
        expect.any(Object)
      );
    });
  });

  describe('getPatientConditions', () => {
    it('should fetch conditions for a patient', async () => {
      const mockBundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        entry: [
          {
            resource: {
              resourceType: 'Condition',
              id: 'cond-1',
              code: { coding: [{ code: '59621000', display: 'Hypertension' }] },
            },
          },
        ],
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBundle),
      }));

      const result = await getPatientConditions('patient-123');

      expect(fetch).toHaveBeenCalledWith(
        '/fhir/Condition?patient=patient-123&_count=100',
        expect.any(Object)
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('cond-1');
    });

    it('should return empty array when no conditions', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ resourceType: 'Bundle', entry: [] }),
      }));

      const result = await getPatientConditions('patient-123');
      expect(result).toHaveLength(0);
    });
  });

  describe('getPatientMedications', () => {
    it('should fetch medications for a patient', async () => {
      const mockBundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        entry: [
          {
            resource: {
              resourceType: 'MedicationRequest',
              id: 'med-1',
              status: 'active',
              intent: 'order',
              medicationCodeableConcept: { text: 'Lisinopril' },
            },
          },
        ],
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBundle),
      }));

      const result = await getPatientMedications('patient-123');

      expect(fetch).toHaveBeenCalledWith(
        '/fhir/MedicationRequest?patient=patient-123&_count=100',
        expect.any(Object)
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('med-1');
    });
  });

  describe('getPatientObservations', () => {
    it('should fetch observations for a patient', async () => {
      const mockBundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        entry: [
          {
            resource: {
              resourceType: 'Observation',
              id: 'obs-1',
              status: 'final',
              code: { coding: [{ code: '39156-5' }] },
              valueQuantity: { value: 24.5 },
            },
          },
        ],
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBundle),
      }));

      const result = await getPatientObservations('patient-123');

      expect(fetch).toHaveBeenCalledWith(
        '/fhir/Observation?patient=patient-123&_count=200',
        expect.any(Object)
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('getPatientDetails', () => {
    it('should fetch all patient details in parallel', async () => {
      const mockPatient = {
        resourceType: 'Patient',
        id: 'patient-123',
        name: [{ family: 'Doe' }],
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ resourceType: 'Bundle', entry: [] }),
      }));

      const result = await getPatientDetails(mockPatient as never);

      expect(fetch).toHaveBeenCalledTimes(3);
      expect(result.patient).toBe(mockPatient);
      expect(result.conditions).toEqual([]);
      expect(result.medications).toEqual([]);
      expect(result.observations).toEqual([]);
    });

    it('should throw error when patient has no ID', async () => {
      const mockPatient = {
        resourceType: 'Patient',
        name: [{ family: 'Doe' }],
      };

      await expect(getPatientDetails(mockPatient as never)).rejects.toThrow(
        'Patient ID is required'
      );
    });
  });
});
