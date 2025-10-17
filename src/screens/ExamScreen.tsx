import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Chip, List, Surface, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ExamScreenProps } from '@navigation/types';
import { useAppStore } from '@state/useStore';
import type { ExamPreset, SessionResult, SubjectKey } from '@models/models';
import { radius, spacing, useTheme } from '@ui/theme';

const SUBJECTS: { key: SubjectKey; label: string; color: string }[] = [
  { key: 'geografie', label: 'Geografie', color: '#60A5FA' },
  { key: 'istorie', label: 'Istorie', color: '#FCA5A5' }
];

const BASE_EXAM_BONUS = 10;

const computeFinalGradeLabel = (result: SessionResult | undefined): string | null => {
  if (!result) return null;
  const achieved = result.achievedScore ?? (result.score ?? 0) * (result.maxScore ?? 0);
  const maxScore = result.maxScore ?? 0;
  const finalPoints = achieved + BASE_EXAM_BONUS;
  const grade = maxScore + BASE_EXAM_BONUS === 0 ? 0 : finalPoints / 10;
  const normalized = Math.min(10, Math.max(1, grade));
  return normalized.toFixed(2);
};

export const ExamScreen = ({ navigation }: ExamScreenProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [subject, setSubject] = useState<SubjectKey>('geografie');

  const { presets, sessionResults } = useAppStore((state) => ({
    presets: Object.values(state.catalog.examPresets),
    sessionResults: state.progress.sessionResults
  }));

  const examResultsByPreset = useMemo(() => {
    const map = new Map<string, SessionResult>();
    sessionResults.forEach((result) => {
      if (result.mode !== 'exam' || !result.examPresetId) return;
      const existing = map.get(result.examPresetId);
      const existingFinishedAt = existing?.finishedAt ?? 0;
      const resultFinishedAt = result.finishedAt ?? 0;
      if (!existing || resultFinishedAt > existingFinishedAt) {
        map.set(result.examPresetId, result);
      }
    });
    return map;
  }, [sessionResults]);

  const subjectPresets = useMemo(
    () =>
      presets
        .filter((preset) => preset.subject === subject)
        .sort((a, b) => (b.year ?? 0) - (a.year ?? 0)),
    [presets, subject]
  );

  const handleOpenExam = (preset: ExamPreset) => {
    navigation.navigate('ExamDetail', { presetId: preset.id });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, paddingTop: insets.top + spacing.md }}
    >
      <Surface
        elevation={3}
        style={{
          borderRadius: radius.lg,
          padding: spacing.lg,
          backgroundColor: theme.surface,
          marginBottom: spacing.lg
        }}
      >
        <Text style={{ color: theme.muted, marginBottom: spacing.sm }}>Simulare BAC</Text>
        <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
          {SUBJECTS.map((item) => (
            <Chip
              key={item.key}
              selected={item.key === subject}
              onPress={() => setSubject(item.key)}
              style={{ marginRight: spacing.sm }}
              mode={item.key === subject ? 'flat' : 'outlined'}
              textStyle={{ fontWeight: item.key === subject ? '600' : '400' }}
            >
              {item.label}
            </Chip>
          ))}
        </View>
        <Text style={{ color: theme.text, fontSize: 20, fontWeight: '700' }}>
          Structură examen
        </Text>
        <Text style={{ color: theme.muted, marginBottom: spacing.md }}>
          Simularea respectă structura oficială: Subiectul I (grilă), Subiectul II (itemi semi-obiectivi) și Subiectul
          III (eseu / analiză).
        </Text>
        <List.Section>
          <List.Item
            title="Subiectul I"
            description="15 întrebări grilă cu alegere simplă sau multiplă"
            left={(props) => <List.Icon {...props} icon="numeric-1-circle" color={SUBJECTS.find((s) => s.key === subject)?.color} />}
          />
          <List.Item
            title="Subiectul II"
            description="Întrebări cu răspuns scurt și corelări"
            left={(props) => <List.Icon {...props} icon="numeric-2-circle" color={SUBJECTS.find((s) => s.key === subject)?.color} />}
          />
          <List.Item
            title="Subiectul III"
            description="Eseu aplicat pe tematica disciplinei"
            left={(props) => <List.Icon {...props} icon="numeric-3-circle" color={SUBJECTS.find((s) => s.key === subject)?.color} />}
          />
        </List.Section>
      </Surface>

      <Text style={{ color: theme.text, fontSize: 20, fontWeight: '700', marginBottom: spacing.md }}>
        Alege un examen
      </Text>

      {subjectPresets.map((preset) => {
        const completion = examResultsByPreset.get(preset.id);
        const gradeLabel = computeFinalGradeLabel(completion);

        return (
          <Surface
            key={preset.id}
            elevation={2}
            style={{
              marginBottom: spacing.md,
              padding: spacing.lg,
              borderRadius: radius.lg,
              backgroundColor: theme.surface
            }}
          >
            {completion && gradeLabel ? (
              <Chip
                icon="check-circle"
                compact
                style={{ alignSelf: 'flex-start', marginBottom: spacing.sm, backgroundColor: `${theme.success}1A` }}
                textStyle={{ color: theme.success, fontWeight: '600' }}
              >
                Notă finală • {gradeLabel}
              </Chip>
            ) : null}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, paddingRight: spacing.md }}>
                <Text style={{ color: theme.text, fontSize: 18, fontWeight: '600' }}>{preset.title}</Text>
                <Text style={{ color: theme.muted, marginBottom: spacing.sm }}>
                  Durată: {preset.durationMinutes} minute • {preset.year ?? 'Model oficial'}
                </Text>
              </View>
              <Button mode="contained" onPress={() => handleOpenExam(preset)} icon="eye">
                Vezi subiectul
              </Button>
            </View>
          </Surface>
        );
      })}

      {subjectPresets.length === 0 && (
        <Text style={{ color: theme.muted, textAlign: 'center', marginTop: spacing.lg }}>
          Examenele pentru această disciplină sunt în pregătire.
        </Text>
      )}
    </ScrollView>
  );
};

export default ExamScreen;
