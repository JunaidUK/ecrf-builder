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
      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--chrome-text-body)] hover:bg-gradient-to-r hover:from-[var(--chrome-bg-muted)] hover:to-[var(--chrome-bg-accent)] hover:text-[var(--chrome-text-heading)] rounded-lg transition-all duration-200"
      aria-label={`Add ${label}`}
    >
      <span className="w-5 h-5 rounded-md bg-gradient-to-b from-[var(--chrome-bg-muted)] to-[var(--chrome-bg-inset)] border border-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] flex items-center justify-center text-xs text-[var(--chrome-text-secondary)]">+</span>
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
    <div className="border-b border-[var(--chrome-border-light)] last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold bg-gradient-to-b from-[var(--chrome-text-heading)] to-[var(--chrome-text-body)] bg-clip-text text-transparent hover:from-[#222] hover:to-[var(--chrome-text-primary)]"
        aria-label={`Toggle ${title} section`}
        aria-expanded={isExpanded}
      >
        {title}
        <span className="text-[var(--chrome-text-disabled)]">{isExpanded ? '▼' : '▶'}</span>
      </button>
      {isExpanded && <div className="pb-3 px-1">{children}</div>}
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
      <div className="w-12 bg-gradient-to-b from-white to-[var(--chrome-bg-elevated)] border-r border-[var(--chrome-border-default)] flex flex-col shadow-[2px_0_8px_rgba(0,0,0,0.04)]">
        <button
          onClick={onToggleCollapse}
          className="p-3 text-[var(--chrome-text-tertiary)] hover:text-[var(--chrome-text-body)] hover:bg-gradient-to-b hover:from-[var(--chrome-bg-hover)] hover:to-[var(--chrome-bg-accent)] transition-all duration-200"
          aria-label="Expand criteria panel"
        >
          ▶
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gradient-to-b from-white to-[var(--chrome-bg-surface)] border-r border-[var(--chrome-border-default)] flex flex-col shadow-[2px_0_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--chrome-border-light)] bg-gradient-to-b from-[var(--chrome-bg-surface)] to-[var(--chrome-bg-hover)]">
        <h2 className="text-sm font-semibold bg-gradient-to-b from-[var(--chrome-text-heading)] to-[var(--chrome-text-secondary)] bg-clip-text text-transparent uppercase tracking-wider">Criteria</h2>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-[var(--chrome-text-tertiary)] hover:text-[var(--chrome-text-body)] hover:bg-gradient-to-b hover:from-[var(--chrome-bg-muted)] hover:to-[var(--chrome-bg-inset)] rounded-lg transition-all duration-200"
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
          <div className="border-t border-[var(--chrome-border-light)] mt-2 pt-2">
            <div className="px-3 py-1 text-xs text-[var(--chrome-text-tertiary)] font-medium uppercase tracking-wide">Quick Add</div>
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
