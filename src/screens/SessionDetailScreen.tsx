import { View, Text } from 'react-native';

import ExamResultsContent from '@components/ExamResultsContent';
import PracticeReviewContent from '@components/PracticeReviewContent';
import type { ProfileSessionDetailProps } from '@navigation/types';
import { useAppStore } from '@state/useStore';
import { useTheme } from '@ui/theme';

export const SessionDetailScreen = ({ route }: ProfileSessionDetailProps) => {
  const theme = useTheme();
  const { sessionId } = route.params;

  const session = useAppStore((state) =>
    state.progress.sessionResults.find((item) => item.id === sessionId)
  );

  if (!session) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: theme.text }}>Sesiunea nu a fost găsită.</Text>
      </View>
    );
  }

  if (session.mode === 'exam') {
    return <ExamResultsContent sessionId={sessionId} />;
  }

  return <PracticeReviewContent sessionId={sessionId} />;
};

export default SessionDetailScreen;
