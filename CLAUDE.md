# CLAUDE.md - Development Guidelines

## Core Principles

### 1. Clean, Human-Readable Code
Write code that prioritizes clarity and maintainability over cleverness.

**Requirements:**
- Self-documenting variable and function names
- Maximum function length: 50 lines
- Maximum file length: 300 lines
- Single Responsibility Principle for all functions/components
- Avoid nested ternaries and deep nesting (max 3 levels)
- Use early returns to reduce nesting
- Add comments only when "why" is unclear, not "what"

**Code Style Guidelines** 
TypeScript: Strict type checking, ES modules, explicit return types
Naming: PascalCase for classes/types, camelCase for functions/variables
Files: Lowercase with hyphens, test files with .test.ts suffix
Imports: ES module style, include .js extension, group imports logically
Formatting: 2-space indentation, semicolons required, single quotes preferred
Testing: Co-locate tests with source files, use descriptive test names
Comments: inline comments for complex logic

**Examples:**

✅ **Good:**
```typescript
function calculateAgeFromBirthDate(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear = 
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  
  return hasHadBirthdayThisYear ? age : age - 1;
}
```

❌ **Bad:**
```typescript
function calc(d: string): number {
  return new Date().getFullYear() - new Date(d).getFullYear() - 
    (new Date().getMonth() < new Date(d).getMonth() || 
    (new Date().getMonth() === new Date(d).getMonth() && 
    new Date().getDate() < new Date(d).getDate()) ? 1 : 0);
}
```

### 2. Strict TypeScript Requirements

**All code MUST:**
- Use TypeScript strict mode
- Explicitly type all function parameters and return values
- Avoid `any` type (use `unknown` if type is truly unknown)
- Define interfaces for all object shapes
- Use type guards for runtime type checking
- Export types alongside implementation

**Type Definition Locations:**
```
src/types/
  ├── fhir.types.ts          # FHIR-specific type extensions
  ├── questionnaire.types.ts # Questionnaire builder types
  ├── cohort.types.ts        # Cohort search types
  └── api.types.ts           # API request/response types
```

**Examples:**

✅ **Good:**
```typescript
import { Patient, Bundle } from 'fhir/r4';

interface CohortSearchParams {
  age?: number;
  weight?: {
    value: number;
    unit: 'kg' | 'lbs';
  };
  conditionCodes: string[];
}

interface CohortSearchResult {
  patients: Patient[];
  total: number;
  bundle: Bundle;
}

async function searchCohort(
  params: CohortSearchParams
): Promise<CohortSearchResult> {
  // Implementation
}
```

❌ **Bad:**
```typescript
async function searchCohort(params: any): Promise<any> {
  // Implementation
}
```

**No Implicit Any:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 3. Test-Driven Development (TDD)

**Every feature MUST have tests written BEFORE or ALONGSIDE implementation.**

**Testing Requirements:**
- Minimum 80% code coverage
- Unit tests for all utility functions
- Integration tests for API calls
- Component tests for React components
- E2E tests for critical user flows

**Test File Structure:**
```
src/
  ├── components/
  │   ├── FormBuilder/
  │   │   ├── FormBuilder.tsx
  │   │   └── FormBuilder.test.tsx
  ├── services/
  │   ├── fhirClient.ts
  │   └── fhirClient.test.ts
  └── utils/
      ├── validators.ts
      └── validators.test.ts
```

**Testing Framework:**
- **Unit/Integration**: Vitest
- **React Components**: React Testing Library
- **E2E**: Playwright

**Test Template:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  it('should render correctly', () => {
    // Test implementation
  });

  it('should handle user interaction', async () => {
    // Test implementation
  });

  it('should handle error states', () => {
    // Test implementation
  });
});
```

**Required Test Cases:**
1. **Happy Path**: Test expected behavior
2. **Edge Cases**: Empty data, null, undefined
3. **Error Handling**: API failures, validation errors
4. **User Interactions**: Clicks, form submissions
5. **Async Operations**: Loading states, promises

**Example - Required Tests for FHIR Search:**
```typescript
describe('fhirClient.searchPatients', () => {
  it('should return patients matching age criteria', async () => {
    // Test
  });

  it('should return patients matching multiple conditions', async () => {
    // Test
  });

  it('should handle empty results', async () => {
    // Test
  });

  it('should throw error on network failure', async () => {
    // Test
  });

  it('should handle malformed FHIR responses', async () => {
    // Test
  });
});
```

### 4. Fast-Fail Decision Protocol

**When Claude Code encounters a decision point, STOP and ASK.**

**Decision Points Include:**
- Ambiguous requirements
- Multiple valid implementation approaches
- Technology/library choices not specified in PROJECT.md
- File structure decisions beyond the documented structure
- Breaking changes to existing code
- Performance vs. readability trade-offs
- Third-party dependency additions

**Fast-Fail Template:**

```
🛑 DECISION POINT

Context: [What task is being performed]
Decision Required: [What needs to be decided]

Options:
1. [Option A with pros/cons]
2. [Option B with pros/cons]
3. [Option C with pros/cons]

Recommendation: [If applicable]

Question: Which approach should I take?
```

**Examples of Valid Decision Points:**

✅ **Should Ask:**
- "Should we use Axios or Fetch for HTTP requests?"
- "Should condition search use server-side or client-side filtering?"
- "Should we implement optimistic updates or wait for server confirmation?"
- "The API response structure differs from the spec - how should we handle this?"

❌ **Should NOT Ask:**
- "Should I add a TypeScript type?" (Always yes, per guidelines)
- "Should I write tests?" (Always yes, per guidelines)
- "Should I use descriptive variable names?" (Always yes, per guidelines)

## Code Organization Standards

### Component Structure
```typescript
// 1. Imports (grouped)
import React, { useState, useEffect } from 'react';
import { Patient } from 'fhir/r4';
import { Button } from '@/components/common';
import { searchPatients } from '@/services/fhirClient';
import type { CohortSearchParams } from '@/types/cohort.types';

// 2. Types/Interfaces
interface ComponentProps {
  onSearch: (params: CohortSearchParams) => void;
  isLoading: boolean;
}

// 3. Component
export function ComponentName({ onSearch, isLoading }: ComponentProps) {
  // 3a. Hooks
  const [state, setState] = useState<string>('');

  // 3b. Event handlers
  const handleClick = () => {
    // Implementation
  };

  // 3c. Effects
  useEffect(() => {
    // Implementation
  }, []);

  // 3d. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// 4. Helper functions (if not extracted to utils)
function formatData(data: unknown): string {
  // Implementation
}
```

### File Naming Conventions
- React Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Types: `camelCase.types.ts`
- Tests: `matchingName.test.ts(x)`
- Constants: `SCREAMING_SNAKE_CASE.ts`

### Import Order
1. React/external libraries
2. FHIR types
3. Internal components
4. Internal services/utils
5. Types
6. Styles

## Error Handling

**All async operations MUST handle errors explicitly.**

```typescript
// ✅ Good
async function fetchPatient(id: string): Promise<Patient> {
  try {
    const response = await fetch(`/fhir/Patient/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const patient = await response.json();
    return patient;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to fetch patient:', error.message);
    }
    throw error; // Re-throw for caller to handle
  }
}

// ❌ Bad
async function fetchPatient(id: string) {
  const response = await fetch(`/fhir/Patient/${id}`);
  return response.json();
}
```

## Performance Guidelines

**Only optimize when necessary, but follow these rules:**

1. **Debounce user input** (search fields, autocomplete)
2. **Memoize expensive calculations** (useMemo, useCallback)
3. **Virtualize long lists** (react-window for >100 items)
4. **Lazy load routes** (React.lazy + Suspense)
5. **Cache API responses** (5-minute TTL for terminology)

**Performance is NOT an excuse for unreadable code.**

## Accessibility Requirements

**All interactive elements MUST be keyboard accessible.**

```tsx
// ✅ Good
<button
  onClick={handleClick}
  aria-label="Search for patients"
  disabled={isLoading}
>
  Find Cohort
</button>

// ❌ Bad
<div onClick={handleClick}>
  Find Cohort
</div>
```

**Required Attributes:**
- `aria-label` for icon-only buttons
- `aria-describedby` for form field errors
- `role` for custom interactive elements
- `alt` text for all images

## Git Commit Standards

**Commit messages must be clear and descriptive.**

Format: `<type>: <description>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `test`: Add/update tests
- `refactor`: Code restructure (no functionality change)
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `chore`: Maintenance tasks

Examples:
```
feat: add ICD-10 autocomplete to condition field
fix: correct FHIR search query for age range
test: add unit tests for questionnaire builder
refactor: extract patient search logic to hook
```

## Code Review Checklist

Before submitting code, verify:

- [ ] All functions have explicit TypeScript types
- [ ] No `any` types used
- [ ] All new code has corresponding tests
- [ ] All tests pass (`npm run test`)
- [ ] No console.log statements (use proper logging)
- [ ] Error handling for all async operations
- [ ] Accessibility attributes on interactive elements
- [ ] Component files under 300 lines
- [ ] Functions under 50 lines
- [ ] No magic numbers (use named constants)
- [ ] Meaningful variable names (no single letters except loop indices)

## Logging Standards

**Use structured logging, not console.log**

```typescript
// ✅ Good
import { logger } from '@/utils/logger';

logger.info('Patient search initiated', { 
  criteria: params,
  timestamp: new Date().toISOString() 
});

logger.error('FHIR search failed', { 
  error: error.message,
  endpoint: url 
});

// ❌ Bad
console.log('searching patients');
console.log(error);
```

## Questions?

When in doubt:
1. Check this CLAUDE.md
3. Ask the human (fast-fail)

---

**Remember**: Code is read 10x more than it's written. Optimize for the reader, not the writer.