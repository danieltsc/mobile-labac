import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { Tag } from '@components/Tag';
import { loadMarkdownContent } from '@logic/content';
import type { TopicScreenProps } from '@navigation/types';
import { useAppStore } from '@state/useStore';
import { radius, spacing, useTheme } from '@ui/theme';

export const TopicScreen = ({ route }: TopicScreenProps) => {
  const theme = useTheme();
  const { topicId } = route.params;
  const { topic, isBookmarked, toggleBookmark } = useAppStore((state) => ({
    topic: state.catalog.topics[topicId],
    isBookmarked: !!state.user.bookmarks[
      state.catalog.topics[topicId]?.subject ?? 'geografie'
    ]?.includes(topicId),
    toggleBookmark: state.actions.toggleBookmark
  }));

  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (topic) {
          const text = await loadMarkdownContent(topic.contentMdPath);
          if (mounted) {
            setContent(text);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [topic]);

  if (!topic) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: theme.text }}>Topicul nu a fost găsit.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      <View
        style={{
          marginBottom: spacing.lg,
          borderRadius: radius.md,
          backgroundColor: theme.surface,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: theme.border
        }}
      >
        <Text style={{ color: theme.text, fontSize: 24, fontWeight: '700', marginBottom: spacing.sm }}>
          {topic.title}
        </Text>
        <Text style={{ color: theme.muted, marginBottom: spacing.md }}>{topic.summary}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md }}>
          {topic.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </View>
        <Pressable onPress={() => toggleBookmark(topic.id)} accessibilityRole="button">
          <Text style={{ color: theme.primary }}>
            {isBookmarked ? 'Șterge marcaj' : 'Marchează topicul'}
          </Text>
        </Pressable>
      </View>
      {loading ? (
        <ActivityIndicator color={theme.primary} />
      ) : (
        <View>
          {content.split(/\n{2,}/).map((paragraph, index) => (
            <Text
              key={index}
              style={{
                color: theme.text,
                fontSize: 16,
                lineHeight: 24,
                marginBottom: spacing.md
              }}
            >
              {paragraph.replace(/\n/g, ' ')}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default TopicScreen;
