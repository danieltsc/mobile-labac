import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { spacing, useTheme } from '@ui/theme';

export const formatDuration = (millis: number): string => {
  const totalSeconds = Math.max(0, Math.floor(millis / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const segments = [
    hours > 0 ? String(hours).padStart(2, '0') : null,
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0')
  ].filter(Boolean);

  return segments.join(':');
};

interface TimerProps {
  startedAt: number;
  durationMinutes: number;
  paused?: boolean;
  mode: 'practice' | 'exam';
  onComplete?: () => void;
}

export const Timer = ({ startedAt, durationMinutes, paused, mode, onComplete }: TimerProps) => {
  const theme = useTheme();
  const [remaining, setRemaining] = useState(() => computeRemaining(startedAt, durationMinutes));
  const completedRef = useRef(false);

  useEffect(() => {
    if (paused && mode === 'practice') {
      return;
    }

    const interval = setInterval(() => {
      const nextRemaining = computeRemaining(startedAt, durationMinutes);
      setRemaining(nextRemaining);
      if (nextRemaining <= 0 && !completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [startedAt, durationMinutes, paused, mode, onComplete]);

  useEffect(() => {
    setRemaining(computeRemaining(startedAt, durationMinutes));
  }, [startedAt, durationMinutes]);

  const formatted = useMemo(() => formatDuration(remaining), [remaining]);

  const isLow = remaining <= 5 * 60 * 1000;

  return (
    <View
      style={{
        padding: spacing.sm,
        backgroundColor: isLow ? theme.danger : theme.surface,
        borderRadius: spacing.md
      }}
      accessibilityRole="timer"
      accessibilityLabel={`Timp rămas ${formatted}`}
    >
      <Text
        style={{
          color: isLow ? theme.background : theme.text,
          fontWeight: '600',
          fontSize: 16
        }}
      >
        {formatted}
      </Text>
    </View>
  );
};

const computeRemaining = (startedAt: number, durationMinutes: number): number => {
  const total = durationMinutes * 60 * 1000;
  const elapsed = Date.now() - startedAt;
  return Math.max(0, total - elapsed);
};

export default Timer;
