import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Chip, IconButton, Surface, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { PracticeScreenProps } from '@navigation/types';
import { useAppStore } from '@state/useStore';
import type { SubjectKey, Topic } from '@models/models';
import { radius, spacing, useTheme } from '@ui/theme';

const SUBJECTS: { key: SubjectKey; label: string; icon: string }[] = [
  { key: 'geografie', label: 'Geografie', icon: 'earth' },
  { key: 'istorie', label: 'Istorie', icon: 'book-open' }
];

const QUESTION_BATCHES = [
  { label: '5 întrebări', value: 5 },
  { label: '10 întrebări', value: 10 },
  { label: '20 întrebări', value: 20 }
];

export const PracticeScreen = ({ navigation }: PracticeScreenProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [subject, setSubject] = useState<SubjectKey>('geografie');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(QUESTION_BATCHES[1].value);

  const { topics, toggleBookmark, bookmarks, startSession, questions } = useAppStore((state) => ({
    topics: Object.values(state.catalog.topics),
    toggleBookmark: state.actions.toggleBookmark,
    bookmarks: state.user.bookmarks,
    startSession: state.actions.startSession,
    questions: Object.values(state.catalog.questions)
  }));

  const subjectTopics = useMemo(
    () => topics.filter((topic) => topic.subject === subject),
    [topics, subject]
  );

  const isTopicSelected = (id: string) => selectedTopics.includes(id);
  const isBookmarked = (topic: Topic) => bookmarks[topic.subject]?.includes(topic.id);

  const toggleTopicSelection = (id: string) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleQuickPractice = () => {
    const pool = questions.filter(
      (question) =>
        question.subject === subject &&
        (selectedTopics.length === 0 || question.topics.some((topicId) => selectedTopics.includes(topicId)))
    );
    if (pool.length === 0) return;
    const selection = shuffle(pool).slice(0, questionCount);
    const sessionId = startSession({
      mode: 'practice',
      subject,
      questionIds: selection.map((item) => item.id)
    });
    navigation.navigate('PracticeRunner', { sessionId });
  };

  const handleOpenTopic = (topicId: string) => {
    navigation.navigate('Topic', { topicId });
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
        <Text style={{ color: theme.muted, marginBottom: spacing.sm }}>Alege disciplina</Text>
        <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
          {SUBJECTS.map((item) => (
            <Chip
              key={item.key}
              mode={item.key === subject ? 'flat' : 'outlined'}
              selected={item.key === subject}
              icon={item.icon}
              onPress={() => {
                setSubject(item.key);
                setSelectedTopics([]);
              }}
              style={{ marginRight: spacing.sm }}
            >
              {item.label}
            </Chip>
          ))}
        </View>

        <Text style={{ color: theme.text, fontSize: 20, fontWeight: '700' }}>
          Învățare rapidă
        </Text>
        <Text style={{ color: theme.muted, marginBottom: spacing.md }}>
          Selectează topicurile pe care vrei să le repeți sau începe o recapitulare rapidă.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: spacing.lg, marginBottom: spacing.md }}
        >
          {QUESTION_BATCHES.map((option) => (
            <Chip
              key={option.value}
              selected={questionCount === option.value}
              onPress={() => setQuestionCount(option.value)}
              style={{ marginRight: spacing.sm }}
              mode={questionCount === option.value ? 'flat' : 'outlined'}
            >
              {option.label}
            </Chip>
          ))}
        </ScrollView>

        <Button
          mode="contained"
          icon="lightning-bolt"
          onPress={handleQuickPractice}
          style={{ borderRadius: radius.pill }}
        >
          Începe Testul
        </Button>
      </Surface>

      <Text style={{ color: theme.text, fontSize: 20, fontWeight: '700', marginBottom: spacing.md }}>
        Topicuri recomandate
      </Text>

      {subjectTopics.map((topic) => (
        <Surface
          key={topic.id}
          elevation={2}
          style={{
            marginBottom: spacing.md,
            padding: spacing.lg,
            borderRadius: radius.lg,
            backgroundColor: theme.surface
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, paddingRight: spacing.md }}>
              <Text style={{ color: theme.text, fontSize: 18, fontWeight: '600', marginBottom: spacing.xs }}>
                {topic.title}
              </Text>
              <Text style={{ color: theme.muted, marginBottom: spacing.sm }}>{topic.summary}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.sm }}>
                {topic.tags.map((tag) => (
                  <Chip key={tag} style={{ marginRight: spacing.xs, marginBottom: spacing.xs }} compact>
                    {tag}
                  </Chip>
                ))}
              </View>
              <View style={{ flexDirection: 'row', marginTop: spacing.sm }}>
                <Button mode="text" onPress={() => handleOpenTopic(topic.id)} style={{ marginRight: spacing.sm }}>
                  Vezi teoria
                </Button>
                <Button
                  mode={isTopicSelected(topic.id) ? 'contained' : 'outlined'}
                  onPress={() => toggleTopicSelection(topic.id)}
                >
                  {isTopicSelected(topic.id) ? 'Adăugat' : 'Adaugă la test'}
                </Button>
              </View>
            </View>
            <IconButton
              icon={isBookmarked(topic) ? 'bookmark' : 'bookmark-outline'}
              size={24}
              onPress={() => toggleBookmark(topic.id)}
            />
          </View>
        </Surface>
      ))}
    </ScrollView>
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

export default PracticeScreen;
