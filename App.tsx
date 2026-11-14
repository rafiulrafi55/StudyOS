import React, { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { CreateItemModal, CreateMode, NewItem } from './src/components/CreateItemModal';
import { BottomTabBar } from './src/components/BottomTabBar';
import { Dashboard } from './src/components/Dashboard';
import { HeroCard } from './src/components/HeroCard';
import { ModuleView } from './src/components/ModuleView';
import { AppHeader } from './src/components/AppHeader';
import { AuthProvider, useAuth } from './src/components/AuthProvider';
import { AuthScreen } from './src/components/AuthScreen';
import { SettingsScreen } from './src/components/SettingsScreen';
import { OverviewScreen } from './src/components/OverviewScreen';
import { ThemeProvider, useTheme } from './src/components/ThemeProvider';
import { modules } from './src/data/modules';
import { styles } from './src/styles';
import { AttendanceRecord, Exam, Grade, Note, ScheduleItem, Task, ModuleKey } from './src/types';

const DATA_STORAGE_KEY = '@studyos/data';

type PersistedData = {
  version: 1;
  tasks: Task[];
  schedule: ScheduleItem[];
  exams: Exam[];
  attendance: AttendanceRecord[];
  notes: Note[];
  grades: Grade[];
};

function isPersistedData(value: unknown): value is PersistedData {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<PersistedData>;
  return data.version === 1
    && Array.isArray(data.tasks)
    && Array.isArray(data.schedule)
    && Array.isArray(data.exams)
    && Array.isArray(data.attendance)
    && Array.isArray(data.notes)
    && Array.isArray(data.grades);
}

function MainApp() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [isAuthScreenVisible, setIsAuthScreenVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isOverviewVisible, setIsOverviewVisible] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleKey>('home');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [createMode, setCreateMode] = useState<CreateMode | null>(null);
  const [isFocusRunning, setIsFocusRunning] = useState(false);
  const [isDataHydrated, setIsDataHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const storedData = await AsyncStorage.getItem(DATA_STORAGE_KEY);
        if (!storedData) return;

        const parsedData: unknown = JSON.parse(storedData);
        if (!isPersistedData(parsedData)) {
          throw new Error('Stored StudyOS data has an invalid format.');
        }

        if (isMounted) {
          setTasks(parsedData.tasks);
          setSchedule(parsedData.schedule);
          setExams(parsedData.exams);
          setAttendance(parsedData.attendance);
          setNotes(parsedData.notes);
          setGrades(parsedData.grades);
        }
      } catch (error) {
        console.error('Failed to load local StudyOS data:', error);
      } finally {
        if (isMounted) setIsDataHydrated(true);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isDataHydrated) return;

    const data: PersistedData = {
      version: 1,
      tasks,
      schedule,
      exams,
      attendance,
      notes,
      grades,
    };

    AsyncStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data)).catch(error => {
      console.error('Failed to save local StudyOS data:', error);
    });
  }, [attendance, exams, grades, isDataHydrated, notes, schedule, tasks]);

  useEffect(() => {
    if (user) {
      setIsAuthScreenVisible(false);
    }
  }, [user]);

  const activeLabel = useMemo(
    () => modules.find(module => module.key === activeModule)?.label ?? 'Overview',
    [activeModule],
  );

  const toggleTask = (id: string) => {
    setTasks(current => current.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };
  const deleteItem = (id: string) => {
    setTasks(current => current.filter(item => item.id !== id));
    setSchedule(current => current.filter(item => item.id !== id));
    setExams(current => current.filter(item => item.id !== id));
    setAttendance(current => current.filter(item => item.id !== id));
    setNotes(current => current.filter(item => item.id !== id));
    setGrades(current => current.filter(item => item.id !== id));
  };
  const saveItem = (item: NewItem) => {
    if ('completed' in item) setTasks(current => [item, ...current]);
    else if ('location' in item) setSchedule(current => [item, ...current]);
    else if ('subject' in item && 'date' in item) setExams(current => [item, ...current]);
    else if ('course' in item) setAttendance(current => [item, ...current]);
    else if ('grade' in item) setGrades(current => [item, ...current]);
    else setNotes(current => [item, ...current]);
  };
  const openCreate = (mode: CreateMode) => {
    setCreateMode(mode);
  };
  const closeCreate = () => {
    setCreateMode(null);
  };
  const openFocus = () => {
    setActiveModule('focus');
  };
  const data = {
    tasks,
    schedule,
    exams,
    attendance,
    notes,
    grades,
  };

  if (!isDataHydrated) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#2F6B56" />;
  }

  if (isAuthScreenVisible) {
    return <AuthScreen onClose={() => setIsAuthScreenVisible(false)} />;
  }
  if (isSettingsVisible) {
    return (
      <SettingsScreen
        onClose={() => setIsSettingsVisible(false)}
        onLogin={() => {
          setIsSettingsVisible(false);
          setIsAuthScreenVisible(true);
        }}
      />
    );
  }
  if (isOverviewVisible) {
    return (
      <OverviewScreen
        tasks={tasks}
        attendance={attendance}
        exams={exams}
        onClose={() => setIsOverviewVisible(false)}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkSafeArea]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.app, isDark && styles.darkApp]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <AppHeader
            onLogin={() => setIsAuthScreenVisible(true)}
            onSettings={() => setIsSettingsVisible(true)}
          />
          {activeModule === 'home' && <HeroCard onStartFocus={openFocus} />}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>{activeLabel}</Text>
            <Pressable onPress={() => setIsOverviewVisible(true)}>
              <Text style={styles.seeAll}>View overview</Text>
            </Pressable>
          </View>
          {activeModule === 'home' ? (
            <Dashboard
              tasks={tasks}
              schedule={schedule}
              exams={exams}
              attendance={attendance}
              onToggleTask={toggleTask}
              onOpenModule={setActiveModule}
              onAddTask={() => openCreate('task')}
            />
          ) : (
            <ModuleView
              module={activeModule}
              {...data}
              onToggleTask={toggleTask}
              onDelete={deleteItem}
              onAdd={openCreate}
              isFocusRunning={isFocusRunning}
              onToggleFocus={() => setIsFocusRunning(current => !current)}
            />
          )}
        </ScrollView>
        <BottomTabBar activeModule={activeModule} onSelect={setActiveModule} />
        <CreateItemModal mode={createMode} visible={createMode !== null} onClose={closeCreate} onSave={saveItem} />
      </View>
    </SafeAreaView>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <MainApp />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
