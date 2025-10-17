import ExamResultsContent from '@components/ExamResultsContent';
import type { ExamResultsProps } from '@navigation/types';

export const ExamResultsScreen = ({ route }: ExamResultsProps) => (
  <ExamResultsContent sessionId={route.params.sessionId} />
);

export default ExamResultsScreen;
