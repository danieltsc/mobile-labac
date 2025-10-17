import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Chip, List, ProgressBar, Surface, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ProfileScreenProps } from '@navigation/types';
import { useAppStore } from '@state/useStore';
import type { ExamPreset, Question, SessionResult, SubjectKey } from '@models/models';
import { scoreQuestion } from '@logic/scoring';
import { flattenExamBlueprint } from '@logic/examBlueprint';
import { spacing, radius, useTheme } from '@ui/theme';

export const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { progress, questions, presets, resetProgress } = useAppStore((state) => ({
    progress: state.progress,
    questions: state.catalog.questions,
    presets: state.catalog.examPresets,
    resetProgress: state.actions.resetProgress
  }));

  const totalHours = Math.round((progress.totalStudyMinutes / 60) * 10) / 10;
  const recentSessions = progress.sessionResults.slice(0, 5);

  const [selectedSubject, setSelectedSubject] = useState<SubjectKey>(
    SUBJECT_FILTERS[0]?.key ?? 'geografie'
  );

  const examSectionStats = useMemo(
    () => aggregateExamSectionStats(progress.sessionResults, selectedSubject, presets, questions),
    [progress.sessionResults, selectedSubject, presets, questions]
  );

  const handleReset = () => {
    resetProgress();
  };

  const handleSessionPress = (session: SessionResult) => {
    navigation.navigate('SessionDetail', { sessionId: session.id });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl,
        paddingTop: spacing.xl + insets.top
      }}
    >
      <Text style={{ color: theme.text, fontSize: 24, fontWeight: '700', marginBottom: spacing.md }}>
        Profilul meu
      </Text>

      <Surface
        elevation={3}
        style={{
          borderRadius: radius.lg,
          padding: spacing.lg,
          backgroundColor: theme.surface,
          marginBottom: spacing.lg
        }}
      >
        <Text style={{ color: theme.muted, marginBottom: spacing.sm }}>Rezumat</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <StatTile label="Streak" value={`${progress.streak} zile`} />
          <StatTile label="Timp total" value={`${totalHours} ore`} />
          <StatTile label="Sesiuni" value={`${progress.sessionResults.length}`} />
        </View>
      </Surface>

      <Surface
        elevation={2}
        style={{
          borderRadius: radius.lg,
          padding: spacing.lg,
          backgroundColor: theme.surface,
          marginBottom: spacing.lg
        }}
      >
        <Text style={{ color: theme.text, fontSize: 18, fontWeight: '600', marginBottom: spacing.sm }}>
          Performanță pe subiecte BAC
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md }}>
          {SUBJECT_FILTERS.map((subjectOption) => (
            <Chip
              key={subjectOption.key}
              selected={subjectOption.key === selectedSubject}
              onPress={() => setSelectedSubject(subjectOption.key)}
              style={{ marginRight: spacing.xs, marginBottom: spacing.xs }}
              compact
              mode={subjectOption.key === selectedSubject ? 'flat' : 'outlined'}
            >
              {subjectOption.label}
            </Chip>
          ))}
        </View>

        {examSectionStats.length === 0 ? (
          <Text style={{ color: theme.muted }}>
            Finalizează un examen pentru a vedea performanța pe subiecte BAC la {SUBJECT_LABELS[selectedSubject]}.
          </Text>
        ) : (
          examSectionStats.map((section) => {
            const percent = Math.round(section.accuracy * 100);
            return (
              <View key={section.section} style={{ marginBottom: spacing.sm }}>
                <Text style={{ color: theme.text, fontWeight: '600' }}>{section.label}</Text>
                <ProgressBar
                  progress={section.accuracy}
                  color={theme.primary}
                  style={{ height: 8, borderRadius: radius.sm, marginVertical: spacing.xs }}
                />
                <Text style={{ color: theme.muted }}>{percent}% răspunsuri corecte</Text>
              </View>
            );
          })
        )}
      </Surface>

      <Surface
        elevation={2}
        style={{
          borderRadius: radius.lg,
          padding: spacing.lg,
          backgroundColor: theme.surface,
          marginBottom: spacing.lg
        }}
      >
        <Text style={{ color: theme.text, fontSize: 18, fontWeight: '600', marginBottom: spacing.sm }}>
          Sesiuni recente
        </Text>
        {recentSessions.length === 0 ? (
          <Text style={{ color: theme.muted }}>
            Nu ai sesiuni încă. Începe un test din tab-urile Acasă sau Antrenament.
          </Text>
        ) : (
          recentSessions.map((session) => (
            <List.Item
              key={session.id}
              title={`${session.mode === 'exam' ? 'Examen' : 'Antrenament'} • ${capitalize(session.subject)}`}
              description={`Scor: ${Math.round((session.score ?? 0) * 100)}%`}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={session.mode === 'exam' ? 'clipboard-text' : 'lightning-bolt-outline'}
                />
              )}
              onPress={() => handleSessionPress(session)}
            />
          ))
        )}
      </Surface>

      <Button mode="outlined" onPress={handleReset} icon="restore" textColor={theme.danger}>
        Resetează progresul
      </Button>
    </ScrollView>
  );
};

const StatTile = ({ label, value }: { label: string; value: string }) => {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700' }}>{value}</Text>
      <Text style={{ color: theme.muted }}>{label}</Text>
    </View>
  );
};

const SUBJECT_FILTERS: { key: SubjectKey; label: string }[] = [
  { key: 'geografie', label: 'Geografie' },
  { key: 'istorie', label: 'Istorie' }
];

const SUBJECT_LABELS: Record<SubjectKey, string> = {
  geografie: 'Geografie',
  istorie: 'Istorie'
};

type SectionKey = 'subject1' | 'subject2' | 'subject3';

const SECTION_LABELS: Record<SectionKey, string> = {
  subject1: 'Subiectul I',
  subject2: 'Subiectul II',
  subject3: 'Subiectul III'
};

const aggregateExamSectionStats = (
  sessions: SessionResult[],
  subject: SubjectKey,
  presets: Record<string, ExamPreset>,
  questions: Record<string, Question>
) => {
  const totals: Record<SectionKey, { correct: number; total: number }> = {
    subject1: { correct: 0, total: 0 },
    subject2: { correct: 0, total: 0 },
    subject3: { correct: 0, total: 0 }
  };

  const blueprintCache = new Map<
    string,
    {
      meta: ReturnType<typeof flattenExamBlueprint>['meta'];
      questions: Map<string, Question>;
    }
  >();

  sessions.forEach((session) => {
    if (session.subject !== subject || session.mode !== 'exam') return;

    let meta: ReturnType<typeof flattenExamBlueprint>['meta'] | undefined;
    let blueprintQuestions: Map<string, Question> | undefined;

    if (session.examPresetId) {
      const preset = presets[session.examPresetId];
      if (preset?.structure) {
        let cached = blueprintCache.get(preset.id);
        if (!cached) {
          const flattened = flattenExamBlueprint(preset.structure, session.subject);
          cached = {
            meta: flattened.meta,
            questions: new Map(flattened.questions.map((question) => [question.id, question]))
          };
          blueprintCache.set(preset.id, cached);
        }
        meta = cached.meta;
        blueprintQuestions = cached.questions;
      }
    }

    const orderedQuestionIds = session.questionIds ?? Object.keys(session.answers);

    orderedQuestionIds.forEach((questionId) => {
      const answer = session.answers[questionId];
      let question: Question | undefined = questions[questionId];
      const sectionData = meta?.[questionId];
      const sectionType = sectionData?.sectionType as SectionKey | undefined;

      if (!question && blueprintQuestions) {
        question = blueprintQuestions.get(questionId);
      }

      if (!sectionType || !question) return;

      const weight = question.points ?? sectionData?.points ?? 1;
      const earned = scoreQuestion(question, answer) * weight;

      totals[sectionType].correct += earned;
      totals[sectionType].total += weight;
    });
  });

  return (['subject1', 'subject2', 'subject3'] as const)
    .map((key) => ({
      section: key,
      label: SECTION_LABELS[key],
      accuracy: totals[key].total === 0 ? 0 : totals[key].correct / totals[key].total,
      total: totals[key].total
    }))
    .filter((entry) => entry.total > 0);
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default ProfileScreen;
