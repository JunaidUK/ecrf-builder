import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';

function DemoPage(): ReactNode {
  const navigate = useNavigate();

  const handleStartBuilder = (): void => {
    navigate('/builder');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <h1 className="text-5xl m-0">Cohort Search Builder Demo</h1>
      <p className="text-gray-500 text-center max-w-lg">
        Build FHIR R4 patient search queries using demographic criteria,
        conditions (ICD-10), and observations (LOINC).
      </p>

      <div className="flex gap-4">
        <Button onClick={handleStartBuilder}>Start Building</Button>
        <Link to="/">
          <Button variant="outline">Back</Button>
        </Link>
      </div>
    </div>
  );
}

export default DemoPage;
