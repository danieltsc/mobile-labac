import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMemo } from 'react';

import ExamDetailScreen from '@screens/ExamDetailScreen';
import ExamResultsScreen from '@screens/ExamResultsScreen';
import ExamRunnerScreen from '@screens/ExamRunnerScreen';
import ExamScreen from '@screens/ExamScreen';
import HomeScreen from '@screens/HomeScreen';
import PracticeReviewScreen from '@screens/PracticeReviewScreen';
import PracticeRunnerScreen from '@screens/PracticeRunnerScreen';
import PracticeScreen from '@screens/PracticeScreen';
import ProfileScreen from '@screens/ProfileScreen';
import TopicScreen from '@screens/TopicScreen';
import SessionDetailScreen from '@screens/SessionDetailScreen';
import type {
  ExamStackParamList,
  HomeStackParamList,
  PracticeStackParamList,
  ProfileStackParamList,
  RootTabParamList
} from '@navigation/types';
import { spacing, useTheme } from '@ui/theme';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const PracticeStack = createNativeStackNavigator<PracticeStackParamList>();
const ExamStack = createNativeStackNavigator<ExamStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const stackScreenOptions = {
  headerShown: false
} as const;

const tabIcons: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home-outline',
  Practice: 'school-outline',
  Exam: 'clipboard-outline',
  Profile: 'person-circle-outline'
};

const HomeStackScreen = () => (
  <HomeStack.Navigator screenOptions={stackScreenOptions}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
  </HomeStack.Navigator>
);

const PracticeStackScreen = () => (
  <PracticeStack.Navigator screenOptions={stackScreenOptions}>
    <PracticeStack.Screen name="PracticeHome" component={PracticeScreen} />
    <PracticeStack.Screen name="Topic" component={TopicScreen} />
    <PracticeStack.Screen name="PracticeRunner" component={PracticeRunnerScreen} />
    <PracticeStack.Screen name="PracticeReview" component={PracticeReviewScreen} />
  </PracticeStack.Navigator>
);

const ExamStackScreen = () => (
  <ExamStack.Navigator screenOptions={stackScreenOptions}>
    <ExamStack.Screen name="ExamHome" component={ExamScreen} />
    <ExamStack.Screen name="ExamDetail" component={ExamDetailScreen} />
    <ExamStack.Screen name="ExamRunner" component={ExamRunnerScreen} />
    <ExamStack.Screen name="ExamResults" component={ExamResultsScreen} />
  </ExamStack.Navigator>
);

const ProfileStackScreen = () => (
  <ProfileStack.Navigator screenOptions={stackScreenOptions}>
    <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
    <ProfileStack.Screen name="SessionDetail" component={SessionDetailScreen} />
  </ProfileStack.Navigator>
);

export const AppNavigator = () => {
  const theme = useTheme();

  const tabBarStyle = useMemo(
    () => ({
      backgroundColor: theme.surface,
      borderTopColor: theme.border,
      paddingBottom: spacing.xs,
      height: 64
    }),
    [theme]
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.subtle,
        tabBarStyle,
        tabBarIcon: ({ color, size }) => {
          const iconName = tabIcons[route.name as keyof RootTabParamList] ?? 'ellipse-outline';
          return <Ionicons name={iconName} color={color} size={size} />;
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} options={{ title: 'Acasă' }} />
      {/* <Tab.Screen name="Practice" component={PracticeStackScreen} options={{ title: 'Antrenament' }} /> */}
      <Tab.Screen name="Exam" component={ExamStackScreen} options={{ title: 'Examene' }} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
