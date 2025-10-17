import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import geografie from '../../assets/data/geografie.json';
import istorie from '../../assets/data/istorie.json';
import type {
  ExamPreset,
  ExamBlueprint,
  ExamBlueprintItem,
  Question,
  SessionResult,
  SubjectKey,
  Topic
} from '@models/models';
import { CONTENT_VERSION, STORAGE_KEYS } from './constants';
import type { QuestionAnswer } from '@logic/scoring';
import { evaluateSession, mergeSessionResult } from '@logic/scoring';
import { flattenExamBlueprint } from '@logic/examBlueprint';

export interface CatalogBundle {
  version: string;
  topics: Topic[];
  questions: Question[];
  examPresets: ExamPreset[];
}

interface CatalogState {
  topics: Record<string, Topic>;
  questions: Record<string, Question>;
  examPresets: Record<string, ExamPreset>;
}

interface UserState {
  bookmarks: Record<SubjectKey, string[]>;
  settings: {
    theme: 'system' | 'light' | 'dark';
    timerSounds: boolean;
    haptics: boolean;
  };
}

interface ProgressState {
  sessionResults: SessionResult[];
  totalStudyMinutes: number;
  streak: number;
  lastActivityDate: string | null;
}

export interface ActiveSession {
  id: string;
  mode: 'practice' | 'exam';
  subject: SubjectKey;
  startedAt: number;
  questionIds: string[];
  durationMinutes?: number;
  answers: Record<string, QuestionAnswer>;
  flaggedQuestionIds: string[];
  status: 'active' | 'submitted';
  examBlueprint?: ExamBlueprint;
  examQuestions?: Question[];
  examQuestionMeta?: Record<
    string,
    {
      sectionTitle: string;
      segmentLabel: string;
      sectionType: string;
      points: number;
      item: ExamBlueprintItem;
    }
  >;
  presetId?: string;
}

interface AppState {
  catalog: CatalogState;
  catalogVersion: string | null;
  catalogLoaded: boolean;
  user: UserState;
  progress: ProgressState;
  activeSession?: ActiveSession;
  actions: {
    loadCatalog: () => Promise<void>;
    toggleBookmark: (topicId: string) => void;
    updateSettings: (settings: Partial<UserState['settings']>) => void;
    startSession: (params: {
      mode: ActiveSession['mode'];
      subject: SubjectKey;
      questionIds?: string[];
      durationMinutes?: number;
      blueprint?: ExamBlueprint;
      presetId?: string;
    }) => string;
    recordAnswer: (questionId: string, answer: QuestionAnswer) => void;
    toggleFlagged: (questionId: string) => void;
    submitSession: () => void;
    importLocalContent: (bundle: CatalogBundle) => Promise<void>;
    resetProgress: () => void;
  };
}

const defaultCatalogState: CatalogState = {
  topics: {},
  questions: {},
  examPresets: {}
};

const defaultUserState: UserState = {
  bookmarks: {
    geografie: [],
    istorie: []
  },
  settings: {
    theme: 'system',
    timerSounds: true,
    haptics: true
  }
};

const defaultProgressState: ProgressState = {
  sessionResults: [],
  totalStudyMinutes: 0,
  streak: 0,
  lastActivityDate: null
};

const inMemoryCatalogBundle: CatalogBundle = {
  version: CONTENT_VERSION,
  topics: [...(geografie.topics as Topic[]), ...(istorie.topics as Topic[])],
  questions: [...(geografie.questions as Question[]), ...(istorie.questions as Question[])],
  examPresets: [
    ...(geografie.examPresets as ExamPreset[]),
    ...(istorie.examPresets as ExamPreset[])
  ]
};

const createCatalogState = (bundle: CatalogBundle): CatalogState => ({
  topics: Object.fromEntries(bundle.topics.map((topic) => [topic.id, topic])),
  questions: Object.fromEntries(bundle.questions.map((question) => [question.id, question])),
  examPresets: Object.fromEntries(bundle.examPresets.map((preset) => [preset.id, preset]))
});

const formatDateKey = (timestamp: number): string => new Date(timestamp).toISOString().slice(0, 10);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      catalog: defaultCatalogState,
      catalogVersion: null,
      catalogLoaded: false,
      user: defaultUserState,
      progress: defaultProgressState,
      activeSession: undefined,
      actions: {
        loadCatalog: async () => {
          const storedVersion = await AsyncStorage.getItem(STORAGE_KEYS.contentVersion);
          const bundle = inMemoryCatalogBundle;

          if (storedVersion !== bundle.version) {
            await AsyncStorage.setItem(STORAGE_KEYS.contentVersion, bundle.version);
          }

          set({
            catalog: createCatalogState(bundle),
            catalogVersion: bundle.version,
            catalogLoaded: true
          });
        },
        toggleBookmark: (topicId: string) => {
          const state = get();
          const topic = state.catalog.topics[topicId];
          if (!topic) return;

          const bookmarks = state.user.bookmarks[topic.subject] ?? [];
          const exists = bookmarks.includes(topicId);
          const updated = exists ? bookmarks.filter((id) => id !== topicId) : [...bookmarks, topicId];

          set({
            user: {
              ...state.user,
              bookmarks: {
                ...state.user.bookmarks,
                [topic.subject]: updated
              }
            }
          });
        },
        updateSettings: (settings) => {
          const state = get();
          set({
            user: {
              ...state.user,
              settings: { ...state.user.settings, ...settings }
            }
          });
        },
        startSession: ({ mode, subject, questionIds, durationMinutes, blueprint, presetId }) => {
          const sessionId = `session-${Date.now()}`;
          const examData = blueprint ? flattenExamBlueprint(blueprint, subject) : undefined;
          const derivedQuestionIds =
            questionIds ?? examData?.questions.map((question) => question.id) ?? [];

          set({
            activeSession: {
              id: sessionId,
              mode,
              subject,
              questionIds: derivedQuestionIds,
              startedAt: Date.now(),
              durationMinutes,
              answers: {},
              flaggedQuestionIds: [],
              status: 'active',
              examBlueprint: blueprint,
              examQuestions: examData?.questions,
              examQuestionMeta: examData?.meta,
              presetId
            }
          });
          return sessionId;
        },
        recordAnswer: (questionId, answer) => {
          const state = get();
          if (!state.activeSession) return;
          set({
            activeSession: {
              ...state.activeSession,
              answers: {
                ...state.activeSession.answers,
                [questionId]: answer
              }
            }
          });
        },
        toggleFlagged: (questionId) => {
          const state = get();
          if (!state.activeSession) return;
          const { flaggedQuestionIds } = state.activeSession;
          const exists = flaggedQuestionIds.includes(questionId);
          const nextFlags = exists
            ? flaggedQuestionIds.filter((id) => id !== questionId)
            : [...flaggedQuestionIds, questionId];
          set({
            activeSession: {
              ...state.activeSession,
              flaggedQuestionIds: nextFlags
            }
          });
        },
        submitSession: () => {
          const state = get();
          const { activeSession, catalog, progress } = state;
          if (!activeSession || activeSession.status === 'submitted') return;

          const finishedAt = Date.now();
          const questions =
            activeSession.examQuestions && activeSession.examQuestions.length > 0
              ? activeSession.examQuestions
              : activeSession.questionIds
                  .map((id) => catalog.questions[id])
                  .filter((question): question is Question => Boolean(question));

          const baseResult: SessionResult = {
            id: activeSession.id,
            mode: activeSession.mode,
            subject: activeSession.subject,
            startedAt: activeSession.startedAt,
            finishedAt,
            answers: activeSession.answers,
            questionIds: activeSession.questionIds,
            examPresetId: activeSession.presetId ?? undefined
          };

          const evaluation = evaluateSession(questions, activeSession.answers);
          const result = mergeSessionResult(baseResult, evaluation);

          const minutes =
            Math.max(1, Math.round((finishedAt - activeSession.startedAt) / (60 * 1000))) || 1;
          const activityDate = formatDateKey(finishedAt);
          let streak = 1;
          if (progress.lastActivityDate) {
            const diff =
              (new Date(activityDate).getTime() - new Date(progress.lastActivityDate).getTime()) /
              (1000 * 60 * 60 * 24);
            if (diff === 0) {
              streak = progress.streak;
            } else if (diff === 1) {
              streak = progress.streak + 1;
            }
          }

          set({
            progress: {
              sessionResults: [result, ...progress.sessionResults],
              totalStudyMinutes: progress.totalStudyMinutes + minutes,
              streak,
              lastActivityDate: activityDate
            },
            activeSession: { ...activeSession, status: 'submitted' }
          });
        },
        importLocalContent: async (bundle) => {
          await AsyncStorage.setItem(STORAGE_KEYS.contentVersion, bundle.version);
          set({
            catalog: createCatalogState(bundle),
            catalogVersion: bundle.version,
            catalogLoaded: true
          });
        },
        resetProgress: () => {
          set({
            user: defaultUserState,
            progress: defaultProgressState,
            activeSession: undefined
          });
        }
      }
    }),
    {
      name: 'bacmate-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        progress: state.progress,
        activeSession: state.activeSession
      })
    }
  )
);
