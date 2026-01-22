import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuestionnaire } from '../context/QuestionnaireContext';
import { Button } from '../components/common/Button';

export function BuilderPage(): ReactNode {
  const { id } = useParams<{ id: string }>();
  const { questionnaires, currentQuestionnaire, setCurrentQuestionnaire } =
    useQuestionnaire();

  useEffect(() => {
    if (id) {
      setCurrentQuestionnaire(id);
    }
  }, [id, setCurrentQuestionnaire, questionnaires]);

  if (!currentQuestionnaire) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-3xl font-semibold text-gray-900">
          Questionnaire not found
        </h1>
        <Link to="/demo">
          <Button variant="outline">Back to Demo</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            Questionnaire Builder
          </h1>
          <Link to="/demo">
            <Button variant="outline">Back</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Questionnaire Details
          </h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">URL</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {currentQuestionnaire.url}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {currentQuestionnaire.status}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">ID</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">
                {currentQuestionnaire.id}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Form Items</h2>
          <p className="text-sm text-gray-500">
            No items yet. Form item builder will be added here.
          </p>
        </div>
      </main>
    </div>
  );
}
