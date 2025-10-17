import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Surface, Text, TextInput as PaperTextInput } from 'react-native-paper';

import type { Question } from '@models/models';
import type { QuestionAnswer } from '@logic/scoring';
import { scoreQuestion } from '@logic/scoring';
import { radius, spacing, useTheme } from '@ui/theme';
import { ChoiceOption } from './ChoiceOption';

interface QuestionCardProps {
  question: Question;
  answer?: QuestionAnswer;
  onAnswer: (answer: QuestionAnswer) => void;
  showFeedback?: boolean;
  disabled?: boolean;
}

export const QuestionCard = ({
  question,
  answer,
  onAnswer,
  showFeedback,
  disabled
}: QuestionCardProps) => {
  const theme = useTheme();
  const [shortValue, setShortValue] = useState(answer?.text ?? '');

  useEffect(() => {
    setShortValue(answer?.text ?? '');
  }, [answer?.text, question.id]);

  const renderChoices = () => {
    if (!question.choices) return null;
    return question.choices.map((choice) => {
      const isSelected = answer?.choiceIds?.includes(choice.id);
      const isCorrect = question.correctChoiceIds?.includes(choice.id) ?? false;
      const showCorrect = showFeedback && isCorrect;
      const displaySelected = isSelected || showCorrect;
      const handlePress = () => {
        if (disabled) return;
        if (question.kind === 'single') {
          onAnswer({ choiceIds: [choice.id] });
        } else {
          const current = new Set(answer?.choiceIds ?? []);
          if (current.has(choice.id)) {
            current.delete(choice.id);
          } else {
            current.add(choice.id);
          }
          onAnswer({ choiceIds: Array.from(current) });
        }
      };

      return (
        <ChoiceOption
          key={choice.id}
          label={choice.text}
          selected={isSelected}
          showAsCorrect={showCorrect}
          onPress={handlePress}
          disabled={disabled}
        />
      );
    });
  };

  const resultScore = showFeedback ? scoreQuestion(question, answer) : undefined;

  return (
    <Surface elevation={2} style={{ borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg }}>
      <Text style={{ color: theme.muted, fontWeight: '600', marginBottom: spacing.xs }} variant="labelLarge">
        Întrebare
      </Text>
      <Text style={{ color: theme.text, marginBottom: spacing.md }} variant="titleMedium">
        {question.stem}
      </Text>
      {question.kind !== 'short' ? (
        <View>{renderChoices()}</View>
      ) : (
        <PaperTextInput
          value={shortValue}
          editable={!disabled}
          mode="outlined"
          onChangeText={(value) => {
            setShortValue(value);
            onAnswer({ text: value });
          }}
          placeholder="Răspunsul tău"
          style={{ backgroundColor: theme.surface }}
          outlineColor={theme.border}
          activeOutlineColor={theme.primary}
        />
      )}
      {showFeedback && typeof resultScore === 'number' && (
        <View style={{ marginTop: spacing.md }}>
          <Text style={{ color: theme.text, fontWeight: '600' }} variant="bodyLarge">
            {resultScore > 0.999
              ? 'Corect!'
              : resultScore > 0
              ? 'Parțial corect'
              : 'Răspuns greșit'}
          </Text>
          {question.explanation && (
            <Text style={{ color: theme.muted, marginTop: spacing.xs }} variant="bodyMedium">
              {question.explanation}
            </Text>
          )}
        </View>
      )}
    </Surface>
  );
};

export default QuestionCard;
