import { useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { QuestionCard } from '@components/QuestionCard';
import { QuestionNavigator } from '@components/QuestionNavigator';
import type { PracticeRunnerProps } from '@navigation/types';
import { useAppStore } from '@state/useStore';
import { spacing, useTheme } from '@ui/theme';

export const PracticeRunnerScreen = ({ route, navigation }: PracticeRunnerProps) => {
  const theme = useTheme();
  const { sessionId } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);

  const { session, questions, recordAnswer, submitSession } = useAppStore((state) => ({
    session: state.activeSession?.id === sessionId ? state.activeSession : undefined,
    questions: state.activeSession
      ? state.activeSession.questionIds
          .map((id) => state.catalog.questions[id])
          .filter((question) => Boolean(question))
      : [],
    recordAnswer: state.actions.recordAnswer,
    submitSession: state.actions.submitSession
  }));

  const currentQuestion = useMemo(
    () => (questions ? questions[currentIndex] : undefined),
    [questions, currentIndex]
  );

  if (!session || !currentQuestion) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: theme.text }}>Sesiunea nu a fost găsită.</Text>
      </View>
    );
  }

  const activeAnswer = session.answers[currentQuestion.id];
  const isSubmitted = session.status === 'submitted';

  const handleSubmit = () => {
    submitSession();
    navigation.replace('PracticeReview', { sessionId });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: spacing.lg }}
      >
        <Text style={{ color: theme.text, marginBottom: spacing.sm }} variant="titleMedium">
          Întrebarea {currentIndex + 1} din {questions.length}
        </Text>
        <QuestionCard
          question={currentQuestion}
          answer={activeAnswer}
          onAnswer={(answer) => recordAnswer(currentQuestion.id, answer)}
          showFeedback
          disabled={isSubmitted}
        />
        {!isSubmitted && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md }}>
            <Button
              mode="text"
              icon="arrow-left"
              onPress={() => {
                if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
              }}
              disabled={currentIndex === 0}
            >
              Înapoi
            </Button>
            <Button
              mode="contained"
              icon={currentIndex < questions.length - 1 ? 'arrow-right' : 'check'}
              onPress={() => {
                if (currentIndex < questions.length - 1) {
                  setCurrentIndex(currentIndex + 1);
                } else {
                  Alert.alert('Finalizează', 'Finalizezi sesiunea?', [
                    { text: 'Anulează', style: 'cancel' },
                    { text: 'Finalizează', style: 'default', onPress: handleSubmit }
                  ]);
                }
              }}
            >
              {currentIndex < questions.length - 1 ? 'Următoarea' : 'Finalizează'}
            </Button>
          </View>
        )}
      </ScrollView>
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
        <QuestionNavigator
          questions={session.questionIds}
          currentIndex={currentIndex}
          flagged={session.flaggedQuestionIds}
          onSelect={(index) => setCurrentIndex(index)}
          disabled={isSubmitted}
        />
      </View>
    </View>
  );
};

export default PracticeRunnerScreen;
