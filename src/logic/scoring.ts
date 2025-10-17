import type { Question, SessionResult } from '@models/models';
import { equalsNormalized } from './romanian';

export interface QuestionAnswer {
  choiceIds?: string[];
  text?: string;
}

export const scoreSingleChoice = (
  question: Question,
  answer: QuestionAnswer | undefined,
): number => {
  if (!question.correctChoiceIds || !answer?.choiceIds || !question.choices) {
    return 0;
  }
  const [selected] = answer.choiceIds;
  const [correct] = question.correctChoiceIds;
  return selected === correct ? 1 : 0;
};

export const scoreMultipleChoice = (
  question: Question,
  answer: QuestionAnswer | undefined,
): number => {
  if (!question.correctChoiceIds || !answer?.choiceIds) {
    return 0;
  }
  const selected = new Set(answer.choiceIds);
  const correct = new Set(question.correctChoiceIds);

  const intersectionSize = [...selected].filter((choice) => correct.has(choice)).length;
  const unionSize = new Set([...selected, ...correct]).size;
  if (unionSize === 0) {
    return 0;
  }
  return intersectionSize / unionSize;
};

export const scoreShortAnswer = (
  question: Question,
  answer: QuestionAnswer | undefined,
): number => {
  if (!question.correctShortAnswer || !answer?.text) {
    return 0;
  }
  const normalizedAnswer = answer.text;
  const isMatch = question.correctShortAnswer.some((valid) =>
    equalsNormalized(valid, normalizedAnswer),
  );
  return isMatch ? 1 : 0;
};

export const scoreQuestion = (question: Question, answer: QuestionAnswer | undefined): number => {
  switch (question.kind) {
    case 'single':
      return scoreSingleChoice(question, answer);
    case 'multiple':
      return scoreMultipleChoice(question, answer);
    case 'short':
      return scoreShortAnswer(question, answer);
    default:
      return 0;
  }
};

export interface SessionScoreResult {
  score: number;
  maxScore: number;
  achieved: number;
  topicBreakdown: Record<string, { correct: number; total: number }>;
}

export const evaluateSession = (
  questions: Question[],
  answers: Record<string, QuestionAnswer>,
): SessionScoreResult => {
  let achieved = 0;
  let maxScore = 0;
  const topicBreakdown: SessionScoreResult['topicBreakdown'] = {};

  questions.forEach((question) => {
    const answer = answers[question.id];
    const questionScore = scoreQuestion(question, answer);
    const weight = question.points ?? 1;
    achieved += questionScore * weight;
    maxScore += weight;

    question.topics.forEach((topicId) => {
      const current = topicBreakdown[topicId] ?? { correct: 0, total: 0 };
      topicBreakdown[topicId] = {
        correct: current.correct + (questionScore >= 0.999 ? weight : questionScore * weight),
        total: current.total + weight,
      };
    });
  });

  return {
    score: maxScore === 0 ? 0 : achieved / maxScore,
    maxScore,
    achieved,
    topicBreakdown,
  };
};

export const mergeSessionResult = (
  base: SessionResult,
  evaluation: SessionScoreResult,
): SessionResult => ({
  ...base,
  score: evaluation.score,
  maxScore: evaluation.maxScore,
  achievedScore: evaluation.achieved,
  topicBreakdown: evaluation.topicBreakdown,
});
