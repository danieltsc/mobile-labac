import type {
  ExamBlueprint,
  ExamBlueprintItem,
  Question,
  SubjectKey
} from '@models/models';

export interface FlattenedExamResult {
  questions: Question[];
  meta: Record<
    string,
    {
      sectionTitle: string;
      segmentLabel: string;
      sectionType: string;
      points: number;
      item: ExamBlueprintItem;
    }
  >;
}

export const flattenExamBlueprint = (blueprint: ExamBlueprint, subject: SubjectKey): FlattenedExamResult => {
  const questions: Question[] = [];
  const meta: FlattenedExamResult['meta'] = {};

  const sections: Array<[keyof ExamBlueprint, NonNullable<ExamBlueprint[keyof ExamBlueprint]>]> = [
    ['subject1', blueprint.subject1],
    ['subject2', blueprint.subject2],
    ['subject3', blueprint.subject3]
  ].filter((entry): entry is [keyof ExamBlueprint, NonNullable<ExamBlueprint[keyof ExamBlueprint]>] => Boolean(entry[1]));

  sections.forEach(([sectionKey, section]) => {
    section.segments.forEach((segment) => {
      segment.items.forEach((item, itemIndex) => {
        const questionId = `${sectionKey}-${segment.label}-${itemIndex + 1}`;
        const choices =
          item.options?.map((option, optionIndex) => ({
            id: `option-${optionIndex}`,
            text: option
          })) ?? [];

        questions.push({
          id: questionId,
          subject,
          topics: [],
          kind: 'single',
          stem: `${segment.label}. ${item.text}`,
          choices,
          correctChoiceIds:
            typeof item.correctIndex === 'number' ? [`option-${item.correctIndex}`] : undefined,
          points: item.points ?? 1
        });

        meta[questionId] = {
          sectionTitle: section.title,
          segmentLabel: `${segment.label}.${itemIndex + 1}`,
          sectionType: sectionKey,
          points: item.points ?? 1,
          item
        };
      });
    });
  });

  return { questions, meta };
};
