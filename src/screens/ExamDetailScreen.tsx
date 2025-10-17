import { Image, ScrollView, View } from 'react-native';
import { Button, Chip, Divider, Surface, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getExamAssetModule } from '@logic/examAssets';
import type { ExamDetailProps } from '@navigation/types';
import { useAppStore } from '@state/useStore';
import { radius, spacing, useTheme } from '@ui/theme';

export const ExamDetailScreen = ({ route, navigation }: ExamDetailProps) => {
  const theme = useTheme();
  const { presetId } = route.params;
  const insets = useSafeAreaInsets();

  const { preset, startSession } = useAppStore((state) => ({
    preset: state.catalog.examPresets[presetId],
    startSession: state.actions.startSession
  }));

  if (!preset) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <Text variant="bodyLarge" style={{ color: theme.text }}>
          Examenul nu a fost găsit.
        </Text>
      </View>
    );
  }

  const sections = (
    [
      { key: 'subject1' as const, data: preset.structure?.subject1 },
      { key: 'subject2' as const, data: preset.structure?.subject2 },
      { key: 'subject3' as const, data: preset.structure?.subject3 }
    ]
  ).filter((section) => section.data);

  const hasBlueprint = sections.length > 0;

  const handleStartExam = () => {
    const sessionId = startSession({
      mode: 'exam',
      subject: preset.subject,
      questionIds: hasBlueprint ? undefined : preset.questionIds,
      durationMinutes: preset.durationMinutes,
      blueprint: preset.structure,
      presetId: preset.id
    });
    navigation.replace('ExamRunner', { sessionId, presetId: preset.id });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: insets.top }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl + insets.bottom + spacing.lg }}
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
        <Text variant="titleLarge" style={{ color: theme.text, marginBottom: spacing.xs }}>
          {preset.title}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.muted }}>
          Durată: {preset.durationMinutes} minute • {preset.year ?? 'Model oficial'}
        </Text>
      </Surface>
      {sections.map(({ key, data }) => {
        const mapSource = data?.mapImage
          ? (() => {
              try {
                return getExamAssetModule(data.mapImage!);
              } catch {
                return undefined;
              }
            })()
          : undefined;

        return (
          <Surface
            key={key}
            elevation={2}
            style={{
              borderRadius: radius.lg,
              padding: spacing.lg,
              backgroundColor: theme.surface,
              marginBottom: spacing.lg
            }}
          >
            <Text variant="titleMedium" style={{ color: theme.text, marginBottom: spacing.sm }}>
              {data!.title}
            </Text>
            {data!.description && (
              <Text variant="bodyMedium" style={{ color: theme.muted, marginBottom: spacing.md }}>
                {data!.description}
              </Text>
            )}

            {mapSource ? (
              <Surface
                elevation={1}
                style={{
                  borderRadius: radius.lg,
                  overflow: 'hidden',
                  marginBottom: spacing.lg,
                  backgroundColor: theme.surfaceVariant ?? theme.surface
                }}
              >
                <Image source={mapSource} style={{ width: '100%', height: 240 }} resizeMode="contain" />
              </Surface>
            ) : (
              <Surface
                elevation={0}
                style={{
                  borderRadius: radius.lg,
                  padding: spacing.lg,
                  backgroundColor: theme.surfaceVariant ?? theme.surface,
                  marginBottom: spacing.lg
                }}
              >
                <Text variant="bodyMedium" style={{ color: theme.muted }}>
                  Imaginea hărții va fi disponibilă în curând.
                </Text>
              </Surface>
            )}

            {data!.notes?.length ? (
              <View style={{ marginBottom: spacing.lg }}>
                {data!.notes!.map((note, index) => (
                  <Text key={index} variant="bodySmall" style={{ color: theme.subtle, marginBottom: spacing.xs }}>
                    {note}
                  </Text>
                ))}
              </View>
            ) : null}

            {data!.segments.map((segment) => (
              <Surface
                key={segment.label}
                elevation={0}
                style={{
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: theme.border,
                  padding: spacing.lg,
                  marginBottom: spacing.md,
                  backgroundColor: theme.surface
                }}
              >
                <Text variant="titleSmall" style={{ color: theme.text, marginBottom: spacing.sm }}>
                  {segment.label}. {segment.prompt}
                </Text>
                <Divider style={{ marginBottom: spacing.sm, backgroundColor: theme.border }} />
                {segment.items.map((item, index) => (
                  <View key={index} style={{ marginBottom: spacing.sm }}>
                    <Text variant="bodyLarge" style={{ color: theme.text }}>
                      {item.text}
                    </Text>
                    {item.options && (
                      <View style={{ marginTop: spacing.xs }}>
                        {item.options.map((option, optionIndex) => (
                          <Text
                            key={optionIndex}
                            variant="bodyMedium"
                            style={{ color: theme.muted, marginLeft: spacing.sm }}
                          >
                            {String.fromCharCode(97 + optionIndex)}. {option}
                          </Text>
                        ))}
                      </View>
                    )}
                    {item.points !== undefined && (
                      <Chip
                        icon="star-outline"
                        compact
                        style={{ alignSelf: 'flex-start', marginTop: spacing.xs }}
                      >
                        {item.points} puncte
                      </Chip>
                    )}
                  </View>
                ))}
                {segment.notes?.length ? (
                  <View style={{ marginTop: spacing.sm }}>
                    {segment.notes.map((note, noteIndex) => (
                      <Text key={noteIndex} variant="bodySmall" style={{ color: theme.subtle }}>
                        {note}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </Surface>
            ))}
          </Surface>
        );
      })}

      </ScrollView>
      <Surface
        elevation={4}
        style={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          // paddingBottom: insets.bottom + spacing.md,
          borderTopLeftRadius: radius.lg,
          borderTopRightRadius: radius.lg,
          backgroundColor: theme.surface,
          position: 'absolute',
          left: spacing.lg,
          right: spacing.lg,
          bottom: spacing.md,
          borderWidth: 1,
          borderColor: theme.border
        }}
      >
        <Button mode="contained" icon="play-circle" onPress={handleStartExam}>
          Pornește simularea
        </Button>
      </Surface>
    </View>
  );
};

export default ExamDetailScreen;
