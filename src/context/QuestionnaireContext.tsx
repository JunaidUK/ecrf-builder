import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Questionnaire } from 'fhir/r4';

interface QuestionnaireContextValue {
  questionnaires: Questionnaire[];
  currentQuestionnaire: Questionnaire | null;
  addQuestionnaire: (questionnaire: Questionnaire) => void;
  setCurrentQuestionnaire: (id: string) => void;
  updateQuestionnaire: (questionnaire: Questionnaire) => void;
}

const QuestionnaireContext = createContext<QuestionnaireContextValue | null>(null);

interface QuestionnaireProviderProps {
  children: ReactNode;
}

export function QuestionnaireProvider({ children }: QuestionnaireProviderProps): ReactNode {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [currentQuestionnaire, setCurrentQuestionnaireState] =
    useState<Questionnaire | null>(null);

  const addQuestionnaire = useCallback((questionnaire: Questionnaire): void => {
    setQuestionnaires((prev) => [...prev, questionnaire]);
  }, []);

  const setCurrentQuestionnaire = useCallback((id: string): void => {
    setQuestionnaires((currentQuestionnaires) => {
      const found = currentQuestionnaires.find((q) => q.id === id) ?? null;
      setCurrentQuestionnaireState(found);
      return currentQuestionnaires;
    });
  }, []);

  const updateQuestionnaire = useCallback((questionnaire: Questionnaire): void => {
    setQuestionnaires((prev) =>
      prev.map((q) => (q.id === questionnaire.id ? questionnaire : q))
    );
    setCurrentQuestionnaireState((current) =>
      current?.id === questionnaire.id ? questionnaire : current
    );
  }, []);

  const value: QuestionnaireContextValue = {
    questionnaires,
    currentQuestionnaire,
    addQuestionnaire,
    setCurrentQuestionnaire,
    updateQuestionnaire,
  };

  return (
    <QuestionnaireContext.Provider value={value}>
      {children}
    </QuestionnaireContext.Provider>
  );
}

export function useQuestionnaire(): QuestionnaireContextValue {
  const context = useContext(QuestionnaireContext);

  if (!context) {
    throw new Error('useQuestionnaire must be used within QuestionnaireProvider');
  }

  return context;
}
