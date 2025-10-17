import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { SubjectKey } from '@models/models';

export type RootTabParamList = {
  Home: undefined;
  Practice: undefined;
  Exam: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
};

export type PracticeStackParamList = {
  PracticeHome: undefined;
  Topic: { topicId: string };
  PracticeRunner: { sessionId: string };
  PracticeReview: { sessionId: string };
};

export type ExamStackParamList = {
  ExamHome: undefined;
  ExamDetail: { presetId: string };
  ExamRunner: { sessionId: string; presetId: string };
  ExamResults: { sessionId: string };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  SessionDetail: { sessionId: string };
};

export type HomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Home'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type PracticeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<PracticeStackParamList, 'PracticeHome'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type TopicScreenProps = CompositeScreenProps<
  NativeStackScreenProps<PracticeStackParamList, 'Topic'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type PracticeRunnerProps = CompositeScreenProps<
  NativeStackScreenProps<PracticeStackParamList, 'PracticeRunner'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type PracticeReviewProps = CompositeScreenProps<
  NativeStackScreenProps<PracticeStackParamList, 'PracticeReview'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type ExamScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ExamStackParamList, 'ExamHome'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type ExamRunnerProps = CompositeScreenProps<
  NativeStackScreenProps<ExamStackParamList, 'ExamRunner'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type ExamResultsProps = CompositeScreenProps<
  NativeStackScreenProps<ExamStackParamList, 'ExamResults'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type ExamDetailProps = CompositeScreenProps<
  NativeStackScreenProps<ExamStackParamList, 'ExamDetail'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type ProfileScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type ProfileSessionDetailProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'SessionDetail'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type WithSubject<T = object> = T & { subject: SubjectKey };
