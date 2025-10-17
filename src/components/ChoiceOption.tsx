import { Button } from 'react-native-paper';

import { radius, spacing, useTheme } from '@ui/theme';

interface ChoiceOptionProps {
  label: string;
  selected?: boolean;
  showAsCorrect?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export const ChoiceOption = ({
  label,
  selected,
  showAsCorrect,
  onPress,
  disabled
}: ChoiceOptionProps) => {
  const theme = useTheme();
  const isActive = selected || showAsCorrect;
  const buttonColor = showAsCorrect ? theme.success : theme.primary;
  const textColor = isActive ? theme.surface : theme.text;

  return (
    <Button
      mode={isActive ? 'contained' : 'outlined'}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={{ marginBottom: spacing.sm, borderRadius: radius.lg }}
      contentStyle={{ paddingVertical: spacing.sm, justifyContent: 'flex-start', flexWrap: 'wrap' }}
      labelStyle={{ textAlign: 'left', flexWrap: 'wrap' }}
      buttonColor={isActive ? buttonColor : undefined}
      textColor={textColor}
      icon={showAsCorrect ? 'check-circle' : selected ? 'check' : undefined}
    >
      {label}
    </Button>
  );
};

export default ChoiceOption;
