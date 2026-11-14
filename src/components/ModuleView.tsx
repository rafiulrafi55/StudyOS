import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { CreateMode } from './CreateItemModal';
import { styles } from '../styles';
import { useTheme } from './ThemeProvider';
import { AttendanceRecord, Exam, Grade, Note, ScheduleItem, Task, ModuleKey } from '../types';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

type Props = {
  module: Exclude<ModuleKey, 'home'>;
  tasks: Task[];
  schedule: ScheduleItem[];
  exams: Exam[];
  attendance: AttendanceRecord[];
  notes: Note[];
  grades: Grade[];
  onToggleTask: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (mode: CreateMode) => void;
  isFocusRunning: boolean;
  onToggleFocus: () => void;
};

export function ModuleView({ module, tasks, schedule, exams, attendance, notes, grades, onToggleTask, onDelete, onAdd, isFocusRunning, onToggleFocus }: Props) {
  const { isDark } = useTheme();

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return timeString;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeString;
    }
  };

  if (module === 'focus') {
    return <View style={[styles.focusCard, isDark && styles.darkFocusCard]}><Text style={styles.progressKicker}>FOCUS SESSION</Text><Text style={[styles.focusTitle, isDark && styles.darkText]}>{isFocusRunning ? 'Deep work mode' : 'Ready when you are'}</Text><Text style={styles.timer}>25:00</Text><Text style={[styles.focusHint, isDark && styles.darkMuted]}>Pomodoro · Choose a task to focus on</Text><Pressable style={styles.focusButton} onPress={onToggleFocus}><Text style={styles.focusButtonText}>{isFocusRunning ? 'Pause session' : 'Start session'}</Text></Pressable></View>;
  }

  let title, description, empty, addMode, addLabel, children;

  if (module === 'assignments') {
    title = "Tasks"; description = "Create and manage your assignments and study tasks."; empty = "No tasks yet."; addMode = 'task'; addLabel = "Add task";
    children = tasks.map(task => <ManagedRow key={task.id} title={task.title} detail={task.due} completed={task.completed} onPress={() => onToggleTask(task.id)} onDelete={() => onDelete(task.id)} />);
  } else if (module === 'schedule') {
    title = "Class schedule"; description = "Keep your week organized."; empty = "No classes scheduled."; addMode = 'schedule'; addLabel = "Add class";
    const sortedSchedule = schedule
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        const dayDifference = getDayOrder(a.item.day) - getDayOrder(b.item.day);
        return dayDifference || a.index - b.index;
      })
      .map(({ item }) => item);

    children = sortedSchedule.map((item, index) => {
      const previousItem = sortedSchedule[index - 1];
      const isNewDay = !previousItem || normalizeDay(previousItem.day) !== normalizeDay(item.day);

      return (
        <React.Fragment key={item.id}>
          {isNewDay && <Text style={[styles.moduleDescription, isDark && styles.darkModuleDescription]}>{item.day}</Text>}
          <View style={[styles.managedRow, { flexDirection: 'column', alignItems: 'flex-start', paddingVertical: 12 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 4 }}>
              <Text style={[styles.moduleRowText, isDark && styles.darkModuleRowText, { fontWeight: '700', fontSize: 14 }]}>{item.title}</Text>
              <Pressable onPress={() => onDelete(item.id)} accessibilityLabel={`Delete ${item.title}`}><Text style={styles.deleteText}>×</Text></Pressable>
            </View>
            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
              <Text style={[styles.managedDetail, isDark && styles.darkManagedDetail, { fontSize: 12 }]}>{item.day}</Text>
              <Text style={[styles.managedDetail, isDark && styles.darkManagedDetail, { fontSize: 12 }]}>{formatTime(item.time)}</Text>
              <Text style={[styles.managedDetail, isDark && styles.darkManagedDetail, { fontSize: 12 }]}>{item.location}</Text>
            </View>
          </View>
        </React.Fragment>
      );
    });
  } else if (module === 'exams') {
    title = "Examinations"; description = "Track every upcoming exam."; empty = "No exams added."; addMode = 'exam'; addLabel = "Add exam";
    children = exams.map(item => <ManagedRow key={item.id} title={item.subject} detail={item.date} onDelete={() => onDelete(item.id)} />);
  } else if (module === 'attendance') {
    title = "Attendance"; description = "Track attendance and minimum requirements."; empty = "No courses tracked."; addMode = 'attendance'; addLabel = "Track course";
    children = attendance.map(item => <ManagedRow key={item.id} title={item.course} detail={`${item.present}/${item.total} classes · ${item.total ? Math.round(item.present / item.total * 100) : 0}% (target ${item.target}%)`} onDelete={() => onDelete(item.id)} />);
  } else if (module === 'performance') {
    const points = { A: 4, 'A-': 3.7, B: 3, 'B+': 3.3, 'B-': 2.7, C: 2, D: 1, F: 0 };
    const gpa = grades.length ? (grades.reduce((sum, item) => sum + (points[item.grade.toUpperCase() as keyof typeof points] ?? 0) * item.credits, 0) / Math.max(grades.reduce((sum, item) => sum + item.credits, 0), 1)).toFixed(2) : '—';
    title = "Academic performance"; description = `Current GPA: ${gpa}`; empty = "No results added."; addMode = 'grade'; addLabel = "Add result";
    children = grades.map(item => <ManagedRow key={item.id} title={item.subject} detail={`${item.grade} • ${item.credits} credits`} onDelete={() => onDelete(item.id)} />);
  } else {
    title = "Notes & resources"; description = "Keep your study material in one place."; empty = "No notes yet."; addMode = 'note'; addLabel = "Add note";
    children = notes.map(item => <ManagedRow key={item.id} title={item.title} detail={`${item.subject}${item.content ? ` • ${item.content}` : ''}`} onDelete={() => onDelete(item.id)} />);
  }

  return (
    <View>
      <Pressable style={[styles.addActivityButton, isDark && styles.darkAddActivityButton]} onPress={() => onAdd(addMode as CreateMode)}>
        <Text style={styles.addActivityIcon}>＋</Text>
        <Text style={styles.addActivityText}>{addLabel}</Text>
      </Pressable>
      <View style={[styles.moduleCard, isDark && styles.darkModuleCard]}>
        <Text style={[styles.moduleTitle, isDark && styles.darkModuleTitle]}>{title}</Text>
        <Text style={[styles.moduleDescription, isDark && styles.darkModuleDescription]}>{description}</Text>
        {React.Children.count(children) > 0 ? children : <Text style={styles.emptyText}>{empty}</Text>}
      </View>
    </View>
  );
}

function normalizeDay(day: string) {
  return day.trim().toLowerCase();
}

function getDayOrder(day: string) {
  const index = DAYS_OF_WEEK.indexOf(normalizeDay(day));
  return index === -1 ? DAYS_OF_WEEK.length : index;
}

function ManagedRow({ title, detail, completed, onPress, onDelete }: { title: string; detail: string; completed?: boolean; onPress?: () => void; onDelete: () => void }) {
  const { isDark } = useTheme();
  return (
    <View style={styles.managedRow}>
      <Pressable style={styles.managedMain} onPress={onPress}>
        <View style={[styles.moduleBullet, completed && styles.checkboxDone]}>
          {completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.flex}>
          <Text style={[styles.moduleRowText, isDark && styles.darkModuleRowText, completed && styles.taskDone]}>{title}</Text>
          <Text style={[styles.managedDetail, isDark && styles.darkManagedDetail]}>{detail}</Text>
        </View>
      </Pressable>
      <Pressable onPress={onDelete} accessibilityLabel={`Delete ${title}`}>
        <Text style={styles.deleteText}>×</Text>
      </Pressable>
    </View>
  );
}
