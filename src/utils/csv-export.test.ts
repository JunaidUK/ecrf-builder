import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatPatientForExport,
  generateCSVContent,
  downloadCSV,
  exportCohortToCSV,
} from './csv-export';
import type { PatientDetails } from '../services/fhir-client';
import type { Patient, Condition, MedicationRequest } from 'fhir/r4';

describe('csv-export', () => {
  describe('formatPatientForExport', () => {
    it('should format patient details for export', () => {
      const details: PatientDetails = {
        patient: {
          resourceType: 'Patient',
          id: 'patient-123',
          name: [{ given: ['John'], family: 'Doe' }],
          gender: 'male',
          birthDate: '1990-05-15',
        },
        conditions: [
          {
            resourceType: 'Condition',
            id: 'cond-1',
            clinicalStatus: { coding: [{ code: 'active' }] },
            code: {
              coding: [{ code: '38341003', display: 'Hypertension' }],
            },
          } as Condition,
        ],
        medications: [
          {
            resourceType: 'MedicationRequest',
            id: 'med-1',
            status: 'active',
            medicationCodeableConcept: {
              coding: [{ code: '123456', display: 'Aspirin' }],
            },
          } as MedicationRequest,
        ],
        observations: [],
      };

      const result = formatPatientForExport(details);

      expect(result.patientId).toBe('patient-123');
      expect(result.patientName).toBe('John Doe');
      expect(result.gender).toBe('Male');
      expect(result.birthDate).toBe('1990-05-15');
      expect(result.age).toBeGreaterThan(30);
      expect(result.conditions).toBe('Hypertension');
      expect(result.conditionCodes).toBe('38341003');
      expect(result.medications).toBe('Aspirin');
      expect(result.medicationCodes).toBe('123456');
    });

    it('should filter to only active conditions', () => {
      const details: PatientDetails = {
        patient: {
          resourceType: 'Patient',
          id: 'patient-123',
        },
        conditions: [
          {
            resourceType: 'Condition',
            id: 'cond-1',
            clinicalStatus: { coding: [{ code: 'active' }] },
            code: { coding: [{ display: 'Hypertension' }] },
          } as Condition,
          {
            resourceType: 'Condition',
            id: 'cond-2',
            clinicalStatus: { coding: [{ code: 'resolved' }] },
            code: { coding: [{ display: 'Common Cold' }] },
          } as Condition,
          {
            resourceType: 'Condition',
            id: 'cond-3',
            clinicalStatus: { coding: [{ code: 'recurrence' }] },
            code: { coding: [{ display: 'Migraine' }] },
          } as Condition,
        ],
        medications: [],
        observations: [],
      };

      const result = formatPatientForExport(details);

      expect(result.conditions).toBe('Hypertension; Migraine');
    });

    it('should filter to only active medications', () => {
      const details: PatientDetails = {
        patient: {
          resourceType: 'Patient',
          id: 'patient-123',
        },
        conditions: [],
        medications: [
          {
            resourceType: 'MedicationRequest',
            id: 'med-1',
            status: 'active',
            medicationCodeableConcept: { coding: [{ display: 'Aspirin' }] },
          } as MedicationRequest,
          {
            resourceType: 'MedicationRequest',
            id: 'med-2',
            status: 'stopped',
            medicationCodeableConcept: { coding: [{ display: 'Ibuprofen' }] },
          } as MedicationRequest,
        ],
        observations: [],
      };

      const result = formatPatientForExport(details);

      expect(result.medications).toBe('Aspirin');
    });

    it('should handle missing patient data', () => {
      const details: PatientDetails = {
        patient: {
          resourceType: 'Patient',
        },
        conditions: [],
        medications: [],
        observations: [],
      };

      const result = formatPatientForExport(details);

      expect(result.patientId).toBe('');
      expect(result.patientName).toBe('Unknown');
      expect(result.gender).toBe('Unknown');
      expect(result.birthDate).toBe('');
      expect(result.age).toBeNull();
    });
  });

  describe('generateCSVContent', () => {
    it('should generate CSV with headers', () => {
      const data = [
        {
          patientId: 'patient-1',
          patientName: 'John Doe',
          gender: 'Male',
          birthDate: '1990-05-15',
          age: 35,
          conditions: 'Hypertension',
          conditionCodes: '38341003',
          medications: 'Aspirin',
          medicationCodes: '123456',
        },
      ];

      const csv = generateCSVContent(data);
      const lines = csv.split('\n');

      expect(lines[0]).toBe(
        'Patient ID,Patient Name,Gender,Birth Date,Age,Active Conditions,Condition Codes,Active Medications,Medication Codes'
      );
      expect(lines[1]).toBe(
        'patient-1,John Doe,Male,1990-05-15,35,Hypertension,38341003,Aspirin,123456'
      );
    });

    it('should escape fields containing commas', () => {
      const data = [
        {
          patientId: 'patient-1',
          patientName: 'Doe, John',
          gender: 'Male',
          birthDate: '1990-05-15',
          age: 35,
          conditions: 'Condition A, Condition B',
          conditionCodes: '',
          medications: '',
          medicationCodes: '',
        },
      ];

      const csv = generateCSVContent(data);
      const lines = csv.split('\n');

      expect(lines[1]).toContain('"Doe, John"');
      expect(lines[1]).toContain('"Condition A, Condition B"');
    });

    it('should escape fields containing quotes', () => {
      const data = [
        {
          patientId: 'patient-1',
          patientName: 'John "Johnny" Doe',
          gender: 'Male',
          birthDate: '1990-05-15',
          age: 35,
          conditions: '',
          conditionCodes: '',
          medications: '',
          medicationCodes: '',
        },
      ];

      const csv = generateCSVContent(data);
      const lines = csv.split('\n');

      expect(lines[1]).toContain('"John ""Johnny"" Doe"');
    });

    it('should handle null age', () => {
      const data = [
        {
          patientId: 'patient-1',
          patientName: 'John Doe',
          gender: 'Male',
          birthDate: '',
          age: null,
          conditions: '',
          conditionCodes: '',
          medications: '',
          medicationCodes: '',
        },
      ];

      const csv = generateCSVContent(data);
      const lines = csv.split('\n');

      // 9 columns: patientId, patientName, gender, birthDate, age, conditions, conditionCodes, medications, medicationCodes
      expect(lines[1]).toBe('patient-1,John Doe,Male,,,,,,');
    });

    it('should generate CSV with multiple rows', () => {
      const data = [
        {
          patientId: 'patient-1',
          patientName: 'John Doe',
          gender: 'Male',
          birthDate: '1990-05-15',
          age: 35,
          conditions: 'Hypertension',
          conditionCodes: '38341003',
          medications: 'Aspirin',
          medicationCodes: '123456',
        },
        {
          patientId: 'patient-2',
          patientName: 'Jane Smith',
          gender: 'Female',
          birthDate: '1985-10-20',
          age: 40,
          conditions: 'Diabetes',
          conditionCodes: '73211009',
          medications: 'Metformin',
          medicationCodes: '654321',
        },
      ];

      const csv = generateCSVContent(data);
      const lines = csv.split('\n');

      expect(lines).toHaveLength(3);
    });
  });

  describe('downloadCSV', () => {
    let createElementSpy: ReturnType<typeof vi.spyOn>;
    let appendChildSpy: ReturnType<typeof vi.spyOn>;
    let removeChildSpy: ReturnType<typeof vi.spyOn>;
    let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
    let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      const mockLink = {
        setAttribute: vi.fn(),
        click: vi.fn(),
        style: {} as CSSStyleDeclaration,
      };

      createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLAnchorElement);
      appendChildSpy = vi.spyOn(document.body, 'appendChild').mockReturnValue(mockLink as unknown as HTMLAnchorElement);
      removeChildSpy = vi.spyOn(document.body, 'removeChild').mockReturnValue(mockLink as unknown as HTMLAnchorElement);
      createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');
      revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockReturnValue();
    });

    afterEach(() => {
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it('should create a download link and trigger click', () => {
      downloadCSV('test,csv,content', 'test.csv');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test-url');
    });
  });

  describe('exportCohortToCSV', () => {
    beforeEach(() => {
      const mockLink = {
        setAttribute: vi.fn(),
        click: vi.fn(),
        style: {} as CSSStyleDeclaration,
      };

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLAnchorElement);
      vi.spyOn(document.body, 'appendChild').mockReturnValue(mockLink as unknown as HTMLAnchorElement);
      vi.spyOn(document.body, 'removeChild').mockReturnValue(mockLink as unknown as HTMLAnchorElement);
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');
      vi.spyOn(URL, 'revokeObjectURL').mockReturnValue();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should fetch details for each patient and export', async () => {
      const patients: Patient[] = [
        { resourceType: 'Patient', id: 'patient-1', name: [{ family: 'Doe' }] },
        { resourceType: 'Patient', id: 'patient-2', name: [{ family: 'Smith' }] },
      ];

      const getPatientDetails = vi.fn().mockImplementation((patient: Patient) => {
        return Promise.resolve({
          patient,
          conditions: [],
          medications: [],
          observations: [],
        });
      });

      await exportCohortToCSV(patients, getPatientDetails);

      expect(getPatientDetails).toHaveBeenCalledTimes(2);
    });

    it('should report progress during export', async () => {
      const patients: Patient[] = [
        { resourceType: 'Patient', id: 'patient-1' },
        { resourceType: 'Patient', id: 'patient-2' },
        { resourceType: 'Patient', id: 'patient-3' },
      ];

      const getPatientDetails = vi.fn().mockResolvedValue({
        patient: { resourceType: 'Patient' },
        conditions: [],
        medications: [],
        observations: [],
      });

      const onProgress = vi.fn();

      await exportCohortToCSV(patients, getPatientDetails, onProgress);

      expect(onProgress).toHaveBeenCalledTimes(3);
      expect(onProgress).toHaveBeenNthCalledWith(1, { current: 1, total: 3 });
      expect(onProgress).toHaveBeenNthCalledWith(2, { current: 2, total: 3 });
      expect(onProgress).toHaveBeenNthCalledWith(3, { current: 3, total: 3 });
    });
  });
});
