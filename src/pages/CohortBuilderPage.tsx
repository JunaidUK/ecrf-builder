import { useEffect, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Patient, Resource } from 'fhir/r4';
import { Link } from 'react-router-dom';
import { useCohortSearch } from '../context/CohortSearchContext';
import { CriteriaPanel } from '../components/cohort/CriteriaPanel';
import { CriteriaList } from '../components/cohort/CriteriaList';
import { QueryPreviewPanel } from '../components/cohort/QueryPreviewPanel';
import { PatientResultsList } from '../components/cohort/PatientResultsList';
import { PatientDetailModal } from '../components/cohort/PatientDetailModal';
import { FhirResourcePanel } from '../components/cohort/FhirResourcePanel';
import { SelectedCohortPanel } from '../components/cohort/SelectedCohortPanel';
import { useCSVExport } from '../hooks/useCSVExport';
import type { SearchCriterion } from '../types/cohort.types';

export function CohortBuilderPage(): ReactNode {
  const {
    currentSearch,
    queryResults,
    isExecutingQuery,
    queryError,
    selectedPatients,
    initializeSearch,
    addCriterion,
    updateCriterion,
    removeCriterion,
    getGeneratedQuery,
    runQuery,
    clearResults,
    togglePatientSelection,
    selectAllPatients,
    clearSelectedPatients,
    removeSelectedPatient,
  } = useCohortSearch();

  const { isExporting, exportProgress, exportCohort } = useCSVExport();

  const [isCriteriaPanelCollapsed, setIsCriteriaPanelCollapsed] = useState(false);
  const [isCohortPanelCollapsed, setIsCohortPanelCollapsed] = useState(false);
  const [isQueryPanelExpanded, setIsQueryPanelExpanded] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [viewedResource, setViewedResource] = useState<Resource | null>(null);

  const selectedPatientIds = useMemo(() => {
    return new Set(selectedPatients.keys());
  }, [selectedPatients]);

  useEffect(() => {
    if (!currentSearch) {
      initializeSearch('New Cohort Search');
    }
  }, [currentSearch, initializeSearch]);

  const handleAddCriterion = (criterion: SearchCriterion): void => {
    addCriterion(criterion);
    clearResults();
  };

  const handleUpdateCriterion = (
    id: string,
    updates: Partial<SearchCriterion>
  ): void => {
    updateCriterion(id, updates);
    clearResults();
  };

  const handleRemoveCriterion = (id: string): void => {
    removeCriterion(id);
    clearResults();
  };

  const handleRunQuery = (): void => {
    runQuery();
  };

  const handlePatientClick = (patient: Patient): void => {
    setSelectedPatient(patient);
    setIsPatientModalOpen(true);
  };

  const handleClosePatientModal = (): void => {
    setIsPatientModalOpen(false);
    setSelectedPatient(null);
  };

  const handleViewResource = (resource: Resource): void => {
    setViewedResource(resource);
  };

  const handleCloseResourcePanel = (): void => {
    setViewedResource(null);
  };

  const handleGenerateECRFs = (): void => {
    const patients = Array.from(selectedPatients.values());
    exportCohort(patients);
  };

  const criteria = currentSearch?.criteria ?? [];
  const query = getGeneratedQuery();
  const hasResults = queryResults !== null || queryError !== null;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[var(--chrome-bg-page)] via-[#ffffff] to-[var(--chrome-bg-page-end)]">
      <header className="bg-gradient-to-b from-white to-[var(--chrome-bg-elevated)] border-b border-[var(--chrome-border-default)] px-6 py-4 flex-shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--chrome-bg-muted)] via-[var(--chrome-bg-inset)] to-[var(--chrome-bg-chrome-darkest)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_8px_rgba(0,0,0,0.1)] border border-white/50 flex items-center justify-center">
                <span className="text-sm font-bold bg-gradient-to-b from-[var(--chrome-text-body)] to-[var(--chrome-text-tertiary)] bg-clip-text text-transparent">C</span>
              </div>
            </Link>
            <h1 className="text-xl font-semibold bg-gradient-to-b from-[var(--chrome-text-heading)] to-[var(--chrome-text-secondary)] bg-clip-text text-transparent">
              Cohort Search Builder
            </h1>
          </div>
          <Link to="/">
            <button className="px-5 py-2 rounded-full bg-gradient-to-b from-[var(--chrome-bg-elevated)] to-[var(--chrome-bg-accent)] border border-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] text-[var(--chrome-text-body)] font-medium hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-300 text-sm">
              Back
            </button>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <CriteriaPanel
          onAddCriterion={handleAddCriterion}
          isCollapsed={isCriteriaPanelCollapsed}
          onToggleCollapse={() =>
            setIsCriteriaPanelCollapsed(!isCriteriaPanelCollapsed)
          }
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <CriteriaList
              criteria={criteria}
              onUpdateCriterion={handleUpdateCriterion}
              onRemoveCriterion={handleRemoveCriterion}
            />

            <div className="flex justify-center">
              <button
                onClick={handleRunQuery}
                disabled={isExecutingQuery}
                className="group relative px-8 py-3 rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--chrome-btn-dark-from)] via-[var(--chrome-btn-dark-via)] to-[var(--chrome-btn-dark-to)] rounded-xl"></div>
                <div className="absolute inset-[1px] bg-gradient-to-b from-[var(--chrome-btn-inner-from)] via-[var(--chrome-btn-dark-via)] to-[var(--chrome-btn-inner-to)] rounded-xl"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative text-white drop-shadow-sm">
                  {isExecutingQuery ? 'Searching...' : 'Search Patients'}
                </span>
              </button>
            </div>

            {hasResults && (
              <PatientResultsList
                patients={queryResults?.patients ?? []}
                total={queryResults?.total ?? 0}
                isLoading={isExecutingQuery}
                error={queryError}
                onPatientClick={handlePatientClick}
                selectedPatientIds={selectedPatientIds}
                onToggleSelection={togglePatientSelection}
                onSelectAll={selectAllPatients}
              />
            )}
          </div>
        </main>

        <SelectedCohortPanel
          selectedPatients={selectedPatients}
          isCollapsed={isCohortPanelCollapsed}
          onToggleCollapse={() => setIsCohortPanelCollapsed(!isCohortPanelCollapsed)}
          onRemovePatient={removeSelectedPatient}
          onClearAll={clearSelectedPatients}
          onGenerateECRFs={handleGenerateECRFs}
          isExporting={isExporting}
          exportProgress={exportProgress}
        />
      </div>

      <QueryPreviewPanel
        query={query}
        isExpanded={isQueryPanelExpanded}
        onToggleExpand={() => setIsQueryPanelExpanded(!isQueryPanelExpanded)}
      />

      <PatientDetailModal
        patient={selectedPatient}
        isOpen={isPatientModalOpen}
        onClose={handleClosePatientModal}
        onViewResource={handleViewResource}
      />

      <FhirResourcePanel
        resource={viewedResource}
        onClose={handleCloseResourcePanel}
      />
    </div>
  );
}
