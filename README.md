# eCRF Cohort Builder

A web-based Electronic Case Report Form (eCRF) builder for defining clinical trial eligibility criteria and matching them against a synthetic patient cohort using FHIR R4.

## Capabilities

- **Cohort Criteria Builder** — define inclusion/exclusion criteria using age range, gender, medical conditions, and clinical observations (e.g. BMI, blood pressure, eGFR)- **Condition Search** — search SNOMED CT concepts with real-time autocomplete; criteria are stored with SNOMED codes
- **FHIR Query Generation** — criteria are translated into FHIR R4 search queries, with a live query preview panel
- **Patient Matching** — execute queries against a HAPI FHIR R4 server loaded with synthetic (Synthea) patient data
- **Patient Detail View** — inspect individual patient resources including conditions, medications, and observations
- **Cohort Export** — export selected patients to CSV with demographics, active conditions, and medications

## Tech Stack

### Frontend
| | |
|---|---|
| Framework | React 19 + TypeScript 5.9 |
| Build tool | Vite 7 |
| Routing | React Router DOM 7 |
| Styling | Tailwind CSS 4 |
| State management | React Context API |
| FHIR types | `@types/fhir` (R4) |

### Backend Services
| | |
|---|---|
| FHIR server | HAPI FHIR R4 (latest) |
| Terminology server | Snowstorm (SNOMED International) |
| Database | PostgreSQL 15 |
| Search index | Elasticsearch 8.11 (for Snowstorm) |

### Infrastructure
| | |
|---|---|
| Containerisation | Docker + Docker Compose |
| Web server | Nginx (Alpine) |
| Frontend Host |Vercel |

### Testing & Tooling
| | |
|---|---|
| Unit/integration tests | Vitest + React Testing Library |
| Linting | ESLint 9 |

## Local Setup

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- Node.js 20+ and npm (for frontend-only development)

### Required data files

Before starting the full stack, place the following files in the project root. They are the most recent releases of both Synthea and SNOMED CT, and will be loaded into the requisite servers:

| File | Purpose |
|---|---|
| `synthea_sample_data_fhir_r4_nov2021.zip` | Synthetic patient data loaded into HAPI FHIR |
| `SnomedCT_InternationalRF2_PRODUCTION_20260101T120000Z.zip` | SNOMED CT release loaded into Snowstorm |

The data loaders run once automatically on first startup and write a marker file so they do not re-run on subsequent starts.

### Start the full stack

```bash
docker compose up -d
```

Services:

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| HAPI FHIR | http://localhost:8080/fhir |
| Snowstorm | http://localhost:8081 |

> **Note:** Snowstorm and Elasticsearch are memory-intensive. Elasticsearch is configured with 8 GB heap and Snowstorm with 4 GB. Ensure Docker has at least 16 GB of memory allocated.

The frontend proxies `/fhir/*` and `/snowstorm/*` requests to the backend services via Nginx, so no CORS configuration is required.

### Frontend-only development

Use this when you want to iterate on the UI against already-running backend services.

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

The defaults in `.env.example` work if the Docker stack is running locally. To point at remote services, update the URLs:

```
VITE_FHIR_BASE_URL=https://<your-fhir-tunnel>/fhir
VITE_SNOWSTORM_BASE_URL=https://<your-snowstorm-tunnel>
```

Start the dev server:

```bash
npm run dev
# http://localhost:5173
```

### Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest in watch mode |
| `npm run test:run` | Run tests once and exit |
