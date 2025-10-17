import { Text, View } from 'react-native';

import { radius, spacing, useTheme } from '@ui/theme';

interface TagProps {
  label: string;
}

export const Tag = ({ label }: TagProps) => {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.surface,
        borderRadius: radius.md,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        marginRight: spacing.xs,
        marginBottom: spacing.xs,
        borderWidth: 1,
        borderColor: theme.border
      }}
    >
      <Text style={{ color: theme.muted, fontSize: 12 }}>{label}</Text>
    </View>
  );
};

export default Tag;
