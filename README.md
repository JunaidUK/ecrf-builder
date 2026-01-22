# eCRF Adaptive Form Builder
A web-based Electronic Case Report Form (eCRF) builder that creates FHIR R4 Structured Data Capture (SDC) Questionnaire resources.
The application enables users to build clinical trial eligibility criteria forms and match them against synthetic trial cohort (FHIR R4 Patients) using FHIR-based queries.

## Core Objectives

1. Build intuitive eCRF forms using FHIR Questionnaire resources
2. Enable ICD-10 code search and selection for condition criteria
3. Query FHIR trial cohort data to find matching cohorts
4. Display trial cohort matches and detailed trial cohort resources

### Frontend
- **Framework**: Vite + React 18
- **Language**: TypeScript
- **FHIR Types**: `@types/fhir` (R4)
- **UI Framework**: Tailwind CSS
- **State Management**: React Context API

### Backend Services
- **FHIR Server**: HAPI FHIR R4 (latest version)
- **Terminology Server**: Snowstorm (SNOMED International's terminology server)
  - Will be used for ICD-10 code lookups

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Services**:
  - Frontend (Nginx serving Vite build)
  - HAPI FHIR Server (with PostgreSQL)
  - Snowstorm Server (with Elasticsearch)
