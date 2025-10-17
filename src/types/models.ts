export type SubjectKey = 'geografie' | 'istorie';

export interface Topic {
  id: string;
  subject: SubjectKey;
  title: string;
  summary: string;
  contentMdPath: string;
  tags: string[];
}

export type QuestionKind = 'single' | 'multiple' | 'short';

export interface Question {
  id: string;
  subject: SubjectKey;
  topics: string[];
  kind: QuestionKind;
  stem: string;
  choices?: { id: string; text: string }[];
  correctChoiceIds?: string[];
  correctShortAnswer?: string[];
  explanation?: string;
  refTopicId?: string;
  difficulty?: 1 | 2 | 3;
  points?: number;
}

export interface ExamPreset {
  id: string;
  subject: SubjectKey;
  title: string;
  durationMinutes: number;
  questionIds: string[];
  year?: number;
  source?: string;
  structure?: ExamBlueprint;
}

export interface SessionResult {
  id: string;
  mode: 'practice' | 'exam';
  subject: SubjectKey;
  startedAt: number;
  finishedAt?: number;
  answers: Record<string, { choiceIds?: string[]; text?: string }>;
  score?: number;
  maxScore?: number;
  achievedScore?: number;
  topicBreakdown?: Record<string, { correct: number; total: number }>;
  questionIds?: string[];
  examPresetId?: string;
}

export interface ExamBlueprint {
  subject1?: ExamBlueprintSection;
  subject2?: ExamBlueprintSection;
  subject3?: ExamBlueprintSection;
}

export interface ExamBlueprintSection {
  title: string;
  description?: string;
  mapImage?: string;
  notes?: string[];
  segments: ExamBlueprintSegment[];
}

export interface ExamBlueprintSegment {
  label: string;
  prompt: string;
  items: ExamBlueprintItem[];
  notes?: string[];
  sectionType?: 'subject1' | 'subject2' | 'subject3';
}

export interface ExamBlueprintItem {
  text: string;
  points?: number;
  options?: string[];
  correctIndex?: number;
}
