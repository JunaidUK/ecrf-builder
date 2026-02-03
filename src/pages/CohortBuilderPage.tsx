import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Patient, Resource } from 'fhir/r4';
import { Link } from 'react-router-dom';
import { useCohortSearch } from '../context/CohortSearchContext';
import { Button } from '../components/common/Button';
import { CriteriaPanel } from '../components/cohort/CriteriaPanel';
import { CriteriaList } from '../components/cohort/CriteriaList';
import { QueryPreviewPanel } from '../components/cohort/QueryPreviewPanel';
import { PatientResultsList } from '../components/cohort/PatientResultsList';
import { PatientDetailModal } from '../components/cohort/PatientDetailModal';
import { FhirResourcePanel } from '../components/cohort/FhirResourcePanel';
import type { SearchCriterion } from '../types/cohort.types';

export function CohortBuilderPage(): ReactNode {
  const {
    currentSearch,
    queryResults,
    isExecutingQuery,
    queryError,
    initializeSearch,
    addCriterion,
    updateCriterion,
    removeCriterion,
    getGeneratedQuery,
    runQuery,
    clearResults,
  } = useCohortSearch();

  const [isCriteriaPanelCollapsed, setIsCriteriaPanelCollapsed] = useState(false);
  const [isQueryPanelExpanded, setIsQueryPanelExpanded] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [viewedResource, setViewedResource] = useState<Resource | null>(null);

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

  const criteria = currentSearch?.criteria ?? [];
  const query = getGeneratedQuery();
  const hasResults = queryResults !== null || queryError !== null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            Cohort Search Builder
          </h1>
          <Link to="/demo">
            <Button variant="outline">Back</Button>
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
              <Button
                onClick={handleRunQuery}
                disabled={isExecutingQuery}
              >
                {isExecutingQuery ? 'Searching...' : 'Search Patients'}
              </Button>
            </div>

            {hasResults && (
              <PatientResultsList
                patients={queryResults?.patients ?? []}
                total={queryResults?.total ?? 0}
                isLoading={isExecutingQuery}
                error={queryError}
                onPatientClick={handlePatientClick}
              />
            )}
          </div>
        </main>
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
