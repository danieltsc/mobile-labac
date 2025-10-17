import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QuestionCard } from '@components/QuestionCard';
import { useAppStore } from '@state/useStore';
import { spacing, useTheme } from '@ui/theme';

interface PracticeReviewContentProps {
  sessionId: string;
  title?: string;
}

export const PracticeReviewContent = ({
  sessionId,
  title = 'Rezultate Antrenament'
}: PracticeReviewContentProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { result, questions } = useAppStore((state) => {
    const session = state.progress.sessionResults.find((item) => item.id === sessionId);
    const order = session?.questionIds ?? Object.keys(session?.answers ?? {});
    return {
      result: session,
      questions: order
        .map((id) => state.catalog.questions[id])
        .filter((question): question is NonNullable<typeof question> => Boolean(question))
    };
  });

  if (!result) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: theme.text }}>Nu există rezultate.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.lg, paddingTop: insets.top + spacing.md }}
    >
      <Text style={{ color: theme.text, fontSize: 24, fontWeight: '600', marginBottom: spacing.sm }}>
        {title}
      </Text>
      <Text style={{ color: theme.muted, marginBottom: spacing.lg }}>
        Scor: {Math.round((result.score ?? 0) * 100)}%
      </Text>
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          answer={result.answers[question.id]}
          onAnswer={() => undefined}
          showFeedback
          disabled
        />
      ))}
    </ScrollView>
  );
};

export default PracticeReviewContent;
