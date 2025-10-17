import { Text, View } from 'react-native';

import { spacing, useTheme } from '@ui/theme';

interface EmptyStateProps {
  message: string;
}

export const EmptyState = ({ message }: EmptyStateProps) => {
  const theme = useTheme();

  return (
    <View
      style={{
        paddingVertical: spacing.lg,
        alignItems: 'center'
      }}
    >
      <Text style={{ color: theme.muted }}>{message}</Text>
    </View>
  );
};

export default EmptyState;
