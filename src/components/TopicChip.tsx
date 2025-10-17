import { Pressable, Text } from 'react-native';

import { radius, spacing, useTheme } from '@ui/theme';

interface TopicChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export const TopicChip = ({ label, selected, onPress }: TopicChipProps) => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessible
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
        backgroundColor: selected ? theme.primary : theme.surface,
        borderWidth: 1,
        borderColor: selected ? theme.primary : theme.border,
        marginRight: spacing.sm,
        marginBottom: spacing.sm
      }}
    >
      <Text style={{ color: selected ? theme.background : theme.text }}>{label}</Text>
    </Pressable>
  );
};

export default TopicChip;
