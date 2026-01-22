import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Questionnaire } from 'fhir/r4';
import { Button } from '../components/common/Button';
import { CreateQuestionnaireModal } from '../components/questionnaire/CreateQuestionnaireModal';
import { useQuestionnaire } from '../context/QuestionnaireContext';

function DemoPage(): ReactNode {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { addQuestionnaire } = useQuestionnaire();

  const handleOpenModal = (): void => {
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
  };

  const handleCreate = (questionnaire: Questionnaire): void => {
    addQuestionnaire(questionnaire);
    setIsModalOpen(false);
    navigate(`/builder/${questionnaire.id}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <h1 className="text-5xl m-0">eCRF Builder Demo</h1>

      <div className="flex gap-4">
        <Button onClick={handleOpenModal}>Create new eCRF</Button>
        <Link to="/">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      <CreateQuestionnaireModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreate={handleCreate}
      />
    </div>
  );
}

export default DemoPage;
