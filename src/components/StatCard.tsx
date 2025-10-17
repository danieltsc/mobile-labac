import { Text, View } from 'react-native';

import { radius, spacing, useTheme } from '@ui/theme';

interface StatCardProps {
  label: string;
  value: string;
  description?: string;
}

export const StatCard = ({ label, value, description }: StatCardProps) => {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.surface,
        padding: spacing.lg,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: theme.border,
        marginBottom: spacing.md
      }}
    >
      <Text style={{ color: theme.muted, marginBottom: spacing.xs }}>{label}</Text>
      <Text style={{ color: theme.text, fontSize: 20, fontWeight: '600' }}>{value}</Text>
      {description && <Text style={{ color: theme.muted, marginTop: spacing.xs }}>{description}</Text>}
    </View>
  );
};

export default StatCard;
