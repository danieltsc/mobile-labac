import PracticeReviewContent from '@components/PracticeReviewContent';
import type { PracticeReviewProps } from '@navigation/types';

export const PracticeReviewScreen = ({ route }: PracticeReviewProps) => (
  <PracticeReviewContent sessionId={route.params.sessionId} />
);

export default PracticeReviewScreen;
