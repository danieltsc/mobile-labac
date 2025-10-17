import { ReactNode, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { spacing, useTheme } from '@ui/theme';
import { useAppStore } from './useStore';

interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider = ({ children }: AppStateProviderProps) => {
  const theme = useTheme();
  const catalogLoaded = useAppStore((state) => state.catalogLoaded);
  const loadCatalog = useAppStore((state) => state.actions.loadCatalog);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);

  const initialize = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      await loadCatalog();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'A apărut o eroare neașteptată.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [loadCatalog]);

  useEffect(() => {
    if (!hasAttempted) {
      setHasAttempted(true);
      void initialize();
    }
  }, [hasAttempted, initialize]);

  if (error && !isLoading && !catalogLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.background,
          padding: spacing.lg
        }}
      >
        <Text style={{ color: theme.text, marginBottom: spacing.md, textAlign: 'center' }}>
          {error}
        </Text>
        <Pressable
          onPress={() => void initialize()}
          style={{
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            borderRadius: spacing.md,
            backgroundColor: theme.primary
          }}
        >
          <Text style={{ color: theme.background, fontWeight: '600' }}>Reîncearcă</Text>
        </Pressable>
      </View>
    );
  }

  if (!catalogLoaded || isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.background
        }}
        accessibilityLabel="Se încarcă datele aplicației"
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.muted, marginTop: spacing.md }}>Se încarcă conținutul...</Text>
      </View>
    );
  }

  return <>{children}</>;
};

export default AppStateProvider;
