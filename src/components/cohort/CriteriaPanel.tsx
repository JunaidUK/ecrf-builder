import { useState } from 'react';
import type { ReactNode } from 'react';
import type { SearchCriterion } from '../../types/cohort.types';
import {
  createAgeCriterion,
  createGenderCriterion,
  createConditionCriterion,
  createCustomConditionCriterion,
  createObservationCriterion,
} from '../../utils/cohort-criteria-factory';
import {
  PREDEFINED_CONDITIONS,
  PREDEFINED_OBSERVATIONS,
  SNOMED_SYSTEM,
} from '../../types/fhir-codes.types';
import { ConditionAutocomplete } from './inputs/ConditionAutocomplete';
import type { ICD10SearchResult } from '../../services/terminology-client';

interface CriteriaPanelProps {
  onAddCriterion: (criterion: SearchCriterion) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface CriteriaButtonProps {
  label: string;
  onClick: () => void;
}

function CriteriaButton({ label, onClick }: CriteriaButtonProps): ReactNode {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-md transition-colors"
      aria-label={`Add ${label}`}
    >
      <span className="text-indigo-500">+</span>
      {label}
    </button>
  );
}

interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

function CollapsibleSection({
  title,
  isExpanded,
  onToggle,
  children,
}: CollapsibleSectionProps): ReactNode {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
        aria-label={`Toggle ${title} section`}
        aria-expanded={isExpanded}
      >
        {title}
        <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
      </button>
      {isExpanded && <div className="pb-2">{children}</div>}
    </div>
  );
}

export function CriteriaPanel({
  onAddCriterion,
  isCollapsed,
  onToggleCollapse,
}: CriteriaPanelProps): ReactNode {
  const [isDemographicsExpanded, setIsDemographicsExpanded] = useState(true);
  const [isConditionsExpanded, setIsConditionsExpanded] = useState(true);
  const [isObservationsExpanded, setIsObservationsExpanded] = useState(true);

  const handleAddAge = (): void => {
    onAddCriterion(createAgeCriterion());
  };

  const handleAddGender = (): void => {
    onAddCriterion(createGenderCriterion());
  };

  const handleAddCondition = (key: keyof typeof PREDEFINED_CONDITIONS): void => {
    onAddCriterion(createConditionCriterion(key));
  };

  const handleConditionAutocompleteSelect = (result: ICD10SearchResult): void => {
    onAddCriterion(
      createCustomConditionCriterion(result.snomedCode, result.snomedDisplay, SNOMED_SYSTEM)
    );
  };

  const handleAddObservation = (key: keyof typeof PREDEFINED_OBSERVATIONS): void => {
    onAddCriterion(createObservationCriterion(key, 'gt', 0));
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white border-r border-gray-200 flex flex-col">
        <button
          onClick={onToggleCollapse}
          className="p-3 text-gray-500 hover:bg-gray-50"
          aria-label="Expand criteria panel"
        >
          ▶
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">Criteria</h2>
        <button
          onClick={onToggleCollapse}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          aria-label="Collapse criteria panel"
        >
          ◀
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <CollapsibleSection
          title="Demographics"
          isExpanded={isDemographicsExpanded}
          onToggle={() => setIsDemographicsExpanded(!isDemographicsExpanded)}
        >
          <CriteriaButton label="Age" onClick={handleAddAge} />
          <CriteriaButton label="Gender" onClick={handleAddGender} />
        </CollapsibleSection>

        <CollapsibleSection
          title="Conditions"
          isExpanded={isConditionsExpanded}
          onToggle={() => setIsConditionsExpanded(!isConditionsExpanded)}
        >
          <div className="px-3 py-2">
            <ConditionAutocomplete
              onSelect={handleConditionAutocompleteSelect}
              placeholder="Search conditions..."
            />
          </div>
          <div className="border-t border-gray-100 mt-2 pt-2">
            <div className="px-3 py-1 text-xs text-gray-500 font-medium">Quick Add</div>
            <CriteriaButton
              label="Hypertension"
              onClick={() => handleAddCondition('hypertension')}
            />
            <CriteriaButton
              label="Diabetes"
              onClick={() => handleAddCondition('diabetes')}
            />
            <CriteriaButton
              label="Stroke"
              onClick={() => handleAddCondition('stroke')}
            />
            <CriteriaButton
              label="Heart Failure"
              onClick={() => handleAddCondition('heartFailure')}
            />
            <CriteriaButton
              label="CAD"
              onClick={() => handleAddCondition('cad')}
            />
            <CriteriaButton
              label="MI"
              onClick={() => handleAddCondition('mi')}
            />
            <CriteriaButton
              label="PAD"
              onClick={() => handleAddCondition('pad')}
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Observations"
          isExpanded={isObservationsExpanded}
          onToggle={() => setIsObservationsExpanded(!isObservationsExpanded)}
        >
          <CriteriaButton
            label="BMI"
            onClick={() => handleAddObservation('bmi')}
          />
          <CriteriaButton
            label="Systolic BP"
            onClick={() => handleAddObservation('systolicBp')}
          />
          <CriteriaButton
            label="Diastolic BP"
            onClick={() => handleAddObservation('diastolicBp')}
          />
          <CriteriaButton
            label="eGFR"
            onClick={() => handleAddObservation('egfr')}
          />
          <CriteriaButton
            label="Cholesterol"
            onClick={() => handleAddObservation('cholesterol')}
          />
        </CollapsibleSection>
      </div>
    </div>
  );
}
