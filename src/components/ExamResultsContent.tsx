import { ScrollView, View } from 'react-native';
import { Chip, Surface, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatCard } from '@components/StatCard';
import { useAppStore } from '@state/useStore';
import { spacing, useTheme } from '@ui/theme';
import { scoreQuestion } from '@logic/scoring';
import { flattenExamBlueprint } from '@logic/examBlueprint';

interface ExamResultsContentProps {
  sessionId: string;
  title?: string;
}

export const ExamResultsContent = ({ sessionId, title = 'Rezultate examen' }: ExamResultsContentProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { result, topics, questions, presets } = useAppStore((state) => {
    const session = state.progress.sessionResults.find((item) => item.id === sessionId);
    return {
      result: session,
      topics: state.catalog.topics,
      questions: state.catalog.questions,
      presets: state.catalog.examPresets
    };
  });

  if (!result) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: theme.text }}>Nu există rezultate.</Text>
      </View>
    );
  }

  const accuracy = Math.round((result.score ?? 0) * 100);

  const examPreset = result.examPresetId ? presets[result.examPresetId] : undefined;
  const blueprintData = examPreset?.structure
    ? flattenExamBlueprint(examPreset.structure, result.subject)
    : undefined;

  const blueprintQuestionPairs = blueprintData
    ? blueprintData.questions.map((question) => [question.id, question] as const)
    : [];
  const blueprintQuestionMap = new Map(blueprintQuestionPairs);
  const blueprintMeta = blueprintData?.meta ?? {};

  const orderedQuestionIds = result.questionIds ?? Object.keys(result.answers);

  const questionEntries = orderedQuestionIds
    .map((questionId) => {
      const question = blueprintQuestionMap.get(questionId) ?? questions[questionId];
      if (!question) return null;

      const meta = blueprintMeta[questionId];
      const answer = result.answers[questionId];
      const questionScore = scoreQuestion(question, answer);
      const weight = question.points ?? meta?.points ?? 1;
      const earnedPoints = questionScore * weight;
      const isCorrect = questionScore >= 0.999;
      const isPartiallyCorrect = !isCorrect && questionScore > 0;
      const choices = question.choices ?? [];
      let userDisplay = '';
      let correctDisplay = '';

      if (question.kind === 'short') {
        userDisplay = answer?.text?.trim() ?? '';
        correctDisplay = (question.correctShortAnswer ?? []).join(', ');
      } else {
        const selectedChoices = (answer?.choiceIds ?? [])
          .map((choiceId) => choices.find((choice) => choice.id === choiceId)?.text ?? null)
          .filter((choice): choice is string => Boolean(choice));
        const correctChoices = (question.correctChoiceIds ?? [])
          .map((choiceId) => choices.find((choice) => choice.id === choiceId)?.text ?? null)
          .filter((choice): choice is string => Boolean(choice));
        userDisplay = selectedChoices.join(', ');
        correctDisplay = correctChoices.join(', ');
      }

      return {
        id: questionId,
        question,
        meta,
        earnedPoints,
        maxPoints: weight,
        isCorrect,
        isPartiallyCorrect,
        questionScore,
        userDisplay,
        correctDisplay
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const totalPoints = questionEntries.reduce((sum, entry) => sum + entry.maxPoints, 0);
  const earnedPoints = questionEntries.reduce((sum, entry) => sum + entry.earnedPoints, 0);
  const baseBonus = 10;
  const finalPoints = earnedPoints + baseBonus;
  const finalTotalPoints = totalPoints + baseBonus;
  const grade = finalTotalPoints === 0 ? 0 : Math.min(10, finalPoints / 10);
  const gradeLabel = grade.toFixed(1);

  const formatPoints = (value: number): string => (Number.isInteger(value) ? `${value}` : value.toFixed(1));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl, paddingTop: insets.top + spacing.md }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={{ color: theme.text, fontSize: 24, fontWeight: '600', marginBottom: spacing.sm }}>
        {title}
      </Text>
      <StatCard
        label="Notă finală"
        value={`Notă ${gradeLabel}`}
        description={`${formatPoints(finalPoints)} / ${formatPoints(finalTotalPoints || baseBonus)} puncte`}
      />
      <StatCard label="Răspunsuri corecte" value={`${accuracy}%`} description="Pondere răspunsuri corecte" />
      <StatCard
        label="Durată"
        value={`${Math.round(
          ((result.finishedAt ?? result.startedAt) - result.startedAt) / (60 * 1000)
        )} min`}
      />

      {result.topicBreakdown && Object.keys(result.topicBreakdown).length > 0 ? (
        <View style={{ marginTop: spacing.lg }}>
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: '600', marginBottom: spacing.md }}>
            Performanță pe topicuri
          </Text>
          {Object.entries(result.topicBreakdown).map(([topicId, breakdown]) => {
            const topic = topics[topicId];
            const percent = breakdown.total
              ? Math.round((breakdown.correct / breakdown.total) * 100)
              : 0;
            return (
              <Surface
                key={topicId}
                elevation={1}
                style={{
                  marginBottom: spacing.sm,
                  padding: spacing.md,
                  borderRadius: spacing.md,
                  backgroundColor: theme.surface
                }}
              >
                <Text style={{ color: theme.text, fontWeight: '600' }}>
                  {topic?.title ?? topicId}
                </Text>
                <Text style={{ color: theme.muted }}>
                  {percent}% ({formatPoints(breakdown.correct)} din {formatPoints(breakdown.total)})
                </Text>
              </Surface>
            );
          })}
        </View>
      ) : null}

      <View style={{ marginTop: spacing.xl }}>
        <Text style={{ color: theme.text, fontSize: 20, fontWeight: '700', marginBottom: spacing.md }}>
          Rezultate pe întrebări
        </Text>
        {questionEntries.length === 0 ? (
          <Text style={{ color: theme.muted }}>Nu există întrebări pentru a afișa detalii.</Text>
        ) : (
          (() => {
            let lastSection: string | undefined;
            return questionEntries.map((entry, index) => {
              const sectionChanged = entry.meta?.sectionTitle && entry.meta.sectionTitle !== lastSection;
              if (sectionChanged) {
                lastSection = entry.meta?.sectionTitle;
              }
              const statusColor = entry.isCorrect
                ? theme.success
                : entry.isPartiallyCorrect
                ? theme.info
                : theme.danger;
              const statusLabel = entry.isCorrect
                ? 'Corect'
                : entry.isPartiallyCorrect
                ? 'Parțial'
                : 'Greșit';
              const selectedText = entry.userDisplay && entry.userDisplay.length > 0
                ? entry.userDisplay
                : 'Nu ai oferit un răspuns';
              const correctText = entry.correctDisplay && entry.correctDisplay.length > 0
                ? entry.correctDisplay
                : 'Nu este disponibil';

              return (
                <View key={entry.id} style={{ marginBottom: spacing.md }}>
                  {sectionChanged && lastSection ? (
                    <Text style={{ color: theme.muted, marginBottom: spacing.sm, fontWeight: '600' }}>
                      {lastSection}
                    </Text>
                  ) : null}
                  <Surface
                    elevation={1}
                    style={{
                      padding: spacing.md,
                      borderRadius: spacing.md,
                      backgroundColor: theme.surface
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: spacing.sm
                      }}
                    >
                      <Text style={{ color: theme.text, fontWeight: '600', flex: 1, marginRight: spacing.md }}>
                        {index + 1}. {entry.question.stem}
                      </Text>
                      <Chip
                        compact
                        style={{ backgroundColor: `${statusColor}1A` }}
                        textStyle={{ color: statusColor, fontWeight: '600' }}
                      >
                        {statusLabel}
                      </Chip>
                    </View>
                    <Text style={{ color: theme.muted, marginBottom: spacing.xs }}>
                      Puncte: {formatPoints(entry.earnedPoints)} / {formatPoints(entry.maxPoints)}
                    </Text>
                    <Text style={{ color: theme.text }}>Răspunsul tău: {selectedText}</Text>
                    <Text style={{ color: theme.muted, marginTop: spacing.xs }}>
                      Răspuns corect: {correctText}
                    </Text>
                    {entry.meta?.segmentLabel ? (
                      <Text style={{ color: theme.subtle, marginTop: spacing.xs }}>
                        Subpunct {entry.meta.segmentLabel}
                      </Text>
                    ) : null}
                  </Surface>
                </View>
              );
            });
          })()
        )}
      </View>
    </ScrollView>
  );
};

export default ExamResultsContent;
