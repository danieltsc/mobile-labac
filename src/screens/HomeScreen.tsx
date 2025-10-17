import { ScrollView, View } from 'react-native';
import { Avatar, Button, Divider, Surface, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { HomeScreenProps } from '@navigation/types';
import { useAppStore } from '@state/useStore';
import type { SubjectKey } from '@models/models';
import { radius, spacing, useTheme } from '@ui/theme';
import { SafeLinearGradient } from '@components/SafeLinearGradient';

const SUBJECTS: { key: SubjectKey; label: string; icon: string }[] = [
  { key: 'geografie', label: 'Geografie', icon: 'earth' },
  { key: 'istorie', label: 'Istorie', icon: 'book-open' }
];

export const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { progress, startSession, questions, presets } = useAppStore((state) => ({
    progress: state.progress,
    startSession: state.actions.startSession,
    questions: state.catalog.questions,
    presets: state.catalog.examPresets
  }));

  const totalSessions = progress.sessionResults.length;
  const totalMinutes = progress.totalStudyMinutes;
  const streak = progress.streak;

  const handleQuickPractice = (subject: SubjectKey) => {
    const subjectQuestions = Object.values(questions).filter((question) => question.subject === subject);
    const picked = shuffle(subjectQuestions).slice(0, 5);
    if (picked.length === 0) {
      return;
    }
    const sessionId = startSession({
      mode: 'practice',
      subject,
      questionIds: picked.map((item) => item.id)
    });
    navigation.getParent()?.navigate(
      'Practice',
      {
        screen: 'PracticeRunner',
        params: { sessionId }
      } as never
    );
  };

  const handleQuickExam = (subject: SubjectKey) => {
    const preset = Object.values(presets).find((item) => item.subject === subject);
    if (!preset) return;
    const sessionId = startSession({
      mode: 'exam',
      subject,
      questionIds: preset.questionIds,
      durationMinutes: preset.durationMinutes,
      presetId: preset.id
    });
    navigation.getParent()?.navigate(
      'Exam',
      {
        screen: 'ExamRunner',
        params: { sessionId, presetId: preset.id }
      } as never
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
    >
      <View>
        <SafeLinearGradient
          colors={theme.gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.xl + insets.top,
            paddingBottom: spacing.xxl,
            borderBottomLeftRadius: radius.lg * 2,
            borderBottomRightRadius: radius.lg * 2
          }}
        >
          <Text style={{ color: '#ffffff', fontSize: 26, fontWeight: '700', marginBottom: spacing.sm }}>
            Salut! Hai să învățăm inteligent.
          </Text>
          <Text style={{ color: '#E0E7FF', fontSize: 16, maxWidth: '90%' }}>
            Alege rapid un test sau o simulare și urmărește-ți progresul spre BAC.
          </Text>
        </SafeLinearGradient>
      </View>

      <View style={{ marginTop: -spacing.xxl, paddingHorizontal: spacing.xl }}>
        <Surface
          elevation={3}
          style={{
            padding: spacing.lg,
            borderRadius: radius.lg,
            backgroundColor: theme.surface
          }}
        >
          <Text style={{ color: theme.muted, marginBottom: spacing.sm }}>Statistici rapide</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <StatBlock label="Sesiuni" value={String(totalSessions)} />
            <Divider style={{ width: 1, backgroundColor: theme.border, marginHorizontal: spacing.md }} />
            <StatBlock label="Minute" value={`${totalMinutes}`} />
            <Divider style={{ width: 1, backgroundColor: theme.border, marginHorizontal: spacing.md }} />
            <StatBlock label="Streak" value={`${streak} zile`} />
          </View>
        </Surface>
      </View>

      <View style={{ marginTop: spacing.xl, paddingHorizontal: spacing.xl }}>
        <Text style={{ color: theme.text, fontSize: 20, fontWeight: '700', marginBottom: spacing.md }}>
          Acțiuni rapide
        </Text>

        {SUBJECTS.map((subject) => (
          <Surface
            key={subject.key}
            elevation={2}
            style={{
              marginBottom: spacing.lg,
              padding: spacing.lg,
              borderRadius: radius.lg,
              backgroundColor: theme.surface
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: spacing.md
              }}
            >
              <Avatar.Icon
                icon={subject.icon}
                size={48}
                style={{ backgroundColor: theme.overlay, marginRight: spacing.md }}
                color={theme.primary}
              />
              <Text style={{ color: theme.text, fontSize: 18, fontWeight: '600' }}>{subject.label}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <QuickActionCard
                  title="Test rapid"
                  description="5 întrebări mixte"
                  accent={theme.gradients.practice}
                  onPress={() => handleQuickPractice(subject.key)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <QuickActionCard
                  title="Simulare BAC"
                  description="Subiectele I-III"
                  accent={theme.gradients.exam}
                  onPress={() => handleQuickExam(subject.key)}
                />
              </View>
            </View>
          </Surface>
        ))}
      </View>
    </ScrollView>
  );
};

const QuickActionCard = ({
  title,
  description,
  accent,
  onPress
}: {
  title: string;
  description: string;
  accent: string[];
  onPress: () => void;
}) => (
  <Surface
    elevation={2}
    style={{
      flex: 1,
      borderRadius: radius.lg,
      overflow: 'hidden'
    }}
  >
    <SafeLinearGradient colors={accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: spacing.lg }}>
      <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: spacing.xs }}>{title}</Text>
      <Text style={{ color: 'rgba(255,255,255,0.85)', marginBottom: spacing.md }}>{description}</Text>
      <Button
        mode="contained-tonal"
        onPress={onPress}
        icon="chevron-right"
        style={{ alignSelf: 'flex-start' }}
        textColor="#0F172A"
      >
        Start
      </Button>
    </SafeLinearGradient>
  </Surface>
);

const StatBlock = ({ label, value }: { label: string; value: string }) => {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color: theme.text, fontSize: 20, fontWeight: '700' }}>{value}</Text>
      <Text style={{ color: theme.muted, marginTop: spacing.xs }}>{label}</Text>
    </View>
  );
};

const shuffle = <T,>(items: T[]): T[] => {
  const clone = [...items];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
};

export default HomeScreen;
