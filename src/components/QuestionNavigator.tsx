import { FlatList, Pressable, Text, View } from 'react-native';

import { radius, spacing, useTheme } from '@ui/theme';

interface QuestionNavigatorProps {
  questions: string[];
  currentIndex: number;
  flagged?: string[];
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export const QuestionNavigator = ({
  questions,
  currentIndex,
  flagged = [],
  onSelect,
  disabled
}: QuestionNavigatorProps) => {
  const theme = useTheme();

  return (
    <FlatList
      data={questions}
      horizontal
      keyExtractor={(item) => item}
      contentContainerStyle={{ paddingVertical: spacing.sm }}
      renderItem={({ item, index }) => {
        const isCurrent = index === currentIndex;
        const isFlagged = flagged.includes(item);
        const backgroundColor = isCurrent ? theme.primary : theme.surface;
        const color = isCurrent ? theme.background : theme.text;
        const borderColor = isFlagged ? theme.danger : theme.border;

        return (
          <Pressable
            onPress={() => {
              if (!disabled) onSelect(index);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Întrebarea ${index + 1}`}
            accessibilityHint={isFlagged ? 'Marcată pentru revizuire' : undefined}
            style={{
              minWidth: 44,
              height: 44,
              borderRadius: radius.md,
              backgroundColor,
              borderWidth: 1,
              borderColor,
              marginRight: spacing.sm,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text style={{ color, fontWeight: '600' }}>{index + 1}</Text>
          </Pressable>
        );
      }}
      ListFooterComponent={<View style={{ width: spacing.sm }} />}
    />
  );
};

export default QuestionNavigator;
