import { useMemo, useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { ActivityIndicator, Button, Dialog, Portal, Surface, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QuestionCard } from '@components/QuestionCard';
import Timer from '@components/Timer';
import type { ExamRunnerProps } from '@navigation/types';
import { useAppStore } from '@state/useStore';
import { radius, spacing, useTheme } from '@ui/theme';
import { getExamAssetModule } from '@logic/examAssets';
import { showRewardedAdAsync } from '@logic/ads';

export const ExamRunnerScreen = ({ route, navigation }: ExamRunnerProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { sessionId, presetId } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);

  const { session, questions, questionMeta, recordAnswer, submitSession, preset } =
    useAppStore((state) => {
      const activeSession = state.activeSession?.id === sessionId ? state.activeSession : undefined;
      const derivedQuestions = activeSession
        ? activeSession.examQuestions && activeSession.examQuestions.length > 0
          ? activeSession.examQuestions
          : activeSession.questionIds
              .map((id) => state.catalog.questions[id])
              .filter((question): question is NonNullable<typeof question> => Boolean(question))
        : [];

      return {
        session: activeSession,
        questions: derivedQuestions,
        questionMeta: activeSession?.examQuestionMeta ?? {},
        recordAnswer: state.actions.recordAnswer,
        submitSession: state.actions.submitSession,
        preset: state.catalog.examPresets[presetId]
      };
    });

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

  const isLastQuestion = questions.length > 0 && currentIndex === questions.length - 1;
  const hasAnswer = (() => {
    const response = session.answers[currentQuestion.id];
    if (!response) return false;
    if (currentQuestion.kind === 'short') {
      return Boolean(response.text && response.text.trim().length > 0);
    }
    return (response.choiceIds?.length ?? 0) > 0;
  })();

  const isSubmitted = session.status === 'submitted';
  const answer = session.answers[currentQuestion.id];
  const sectionMeta = questionMeta[currentQuestion.id];
  const isNextSectionBoundary = (() => {
    if (!sectionMeta || questions.length === 0) return false;
    if (currentIndex === questions.length - 1) return false;
    const nextMeta = questionMeta[questions[currentIndex + 1].id];
    return !!(nextMeta && nextMeta.sectionTitle !== sectionMeta.sectionTitle);
  })();
  const blueprint = session.examBlueprint;
  const mapSource = (() => {
    if (!blueprint || !sectionMeta?.sectionType) return undefined;
    const sectionKey = sectionMeta.sectionType as 'subject1' | 'subject2' | 'subject3';
    const sectionData = blueprint?.[sectionKey];
    const mapPath = sectionData?.mapImage;
    if (!mapPath) return undefined;
    try {
      return getExamAssetModule(mapPath);
    } catch {
      return undefined;
    }
  })();

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);

  const completeExam = () => {
    submitSession();
    navigation.replace('ExamResults', { sessionId });
  };

  const handleConfirmPress = async () => {
    setAdError(null);
    setAdLoading(true);
    try {
      const rewarded = await showRewardedAdAsync();
      if (rewarded) {
        setConfirmVisible(false);
        completeExam();
      } else {
        setAdError('Anunțul nu a fost redat complet. Încearcă din nou pentru a accesa rezultatele.');
      }
    } catch (error) {
      setAdError('A apărut o problemă la încărcarea anunțului. Te rugăm să încerci din nou.');
    } finally {
      setAdLoading(false);
    }
  };

  const goNext = () => {
    if (!hasAnswer) {
      return;
    }
    if (isLastQuestion) {
      setAdError(null);
      setConfirmVisible(true);
      return;
    }
    setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const goPrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: insets.top }}>
      <View style={{ padding: spacing.lg, backgroundColor: theme.surface }}>
        <Text style={{ color: theme.text, marginBottom: spacing.sm }} variant="titleLarge">
          {preset?.title ?? 'Examen'}
        </Text>
        <Timer
          startedAt={session.startedAt}
          durationMinutes={session.durationMinutes ?? 180}
          mode="exam"
          onComplete={() => {
            if (!isSubmitted) {
              setAdError(null);
              setConfirmVisible(true);
            }
          }}
        />
      </View>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl + insets.bottom + spacing.lg }}
      >
        {mapSource && (
          <Surface
            elevation={2}
            style={{
              borderRadius: radius.lg,
              overflow: 'hidden',
              marginBottom: spacing.lg,
              backgroundColor: theme.surface
            }}
          >
            <Image source={mapSource} style={{ width: '100%', height: 220 }} resizeMode="cover" />
          </Surface>
        )}
        {sectionMeta && (
          <Text variant="labelLarge" style={{ color: theme.muted, marginBottom: spacing.xs }}>
            {sectionMeta.sectionTitle} • Subpunct {sectionMeta.segmentLabel}
          </Text>
        )}
        <Text style={{ color: theme.text, marginBottom: spacing.sm }} variant="titleMedium">
          Întrebarea {currentIndex + 1} din {questions.length}
        </Text>
        <QuestionCard
          question={currentQuestion}
          answer={answer}
          onAnswer={(value) => recordAnswer(currentQuestion.id, value)}
          showFeedback={isSubmitted}
          disabled={isSubmitted}
        />
      </ScrollView>
      {!isSubmitted ? (
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            backgroundColor: theme.surface,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button
              mode="outlined"
              onPress={goPrevious}
              icon="arrow-left"
              disabled={currentIndex === 0}
              style={{ borderRadius: radius.lg, flex: 1, marginRight: spacing.sm }}
            >
              Înapoi
            </Button>
            <Button
              mode="contained"
              onPress={goNext}
              icon={isLastQuestion ? 'check-circle' : isNextSectionBoundary ? 'book-open-variant' : 'arrow-right'}
              disabled={!hasAnswer}
              style={{ borderRadius: radius.lg, flex: 1, marginLeft: spacing.sm }}
            >
              {isLastQuestion
                ? 'Finalizează examenul'
                : isNextSectionBoundary
                ? 'Următorul subiect'
                : 'Următoarea întrebare'}
            </Button>
          </View>
        </View>
      ) : (
        <View style={{ padding: spacing.lg }}>
          <Button
            mode="contained"
            onPress={() => navigation.replace('ExamResults', { sessionId })}
            icon="chart-box"
            style={{ borderRadius: radius.lg }}
          >
            Vezi rezultatele
          </Button>
        </View>
      )}
      <Portal>
        <Dialog visible={confirmVisible} onDismiss={adLoading ? undefined : () => setConfirmVisible(false)}>
          <Dialog.Title>Finalizezi examenul?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: spacing.sm }}>
              Pentru a vedea rezultatele trebuie să urmărești un scurt anunț recompensat.
            </Text>
            {adError ? (
              <Text variant="bodySmall" style={{ color: theme.danger }}>
                {adError}
              </Text>
            ) : null}
            {adLoading ? (
              <View style={{ marginTop: spacing.md }}>
                <ActivityIndicator color={theme.primary} />
              </View>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmVisible(false)} disabled={adLoading}>
              Încă mai lucrez
            </Button>
            <Button onPress={handleConfirmPress} mode="contained" disabled={adLoading}>
              {adLoading ? 'Se încarcă…' : 'Vezi anunțul'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

export default ExamRunnerScreen;
