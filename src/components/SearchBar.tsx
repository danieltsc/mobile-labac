import { TextInput, View } from 'react-native';

import { radius, spacing, useTheme } from '@ui/theme';

interface SearchBarProps {
  value: string;
  placeholder?: string;
  onChange: (text: string) => void;
}

export const SearchBar = ({ value, onChange, placeholder }: SearchBarProps) => {
  const theme = useTheme();

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.background,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        marginBottom: spacing.md
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.muted}
        style={{ color: theme.text, fontSize: 16 }}
        accessibilityLabel="Căutare"
      />
    </View>
  );
};

export default SearchBar;
