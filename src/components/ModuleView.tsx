import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { CreateMode } from './CreateItemModal';
import { styles } from '../styles';
import { AttendanceRecord, Exam, Grade, Note, ScheduleItem, Task, ModuleKey } from '../types';

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
  if (module === 'focus') {
    return <View style={styles.focusCard}><Text style={styles.progressKicker}>FOCUS SESSION</Text><Text style={styles.focusTitle}>{isFocusRunning ? 'Deep work mode' : 'Ready when you are'}</Text><Text style={styles.timer}>25:00</Text><Text style={styles.focusHint}>Pomodoro · Choose a task to focus on</Text><Pressable style={styles.focusButton} onPress={onToggleFocus}><Text style={styles.focusButtonText}>{isFocusRunning ? 'Pause session' : 'Start session'}</Text></Pressable></View>;
  }
  if (module === 'assignments') {
    return <ListCard title="Tasks" description="Create and manage your assignments and study tasks." empty="No tasks yet." onAdd={() => onAdd('task')} addLabel="Add task">
      {tasks.map(task => <ManagedRow key={task.id} title={task.title} detail={task.due} completed={task.completed} onPress={() => onToggleTask(task.id)} onDelete={() => onDelete(task.id)} />)}
    </ListCard>;
  }
  if (module === 'schedule') {
    return <ListCard title="Class schedule" description="Keep your week organized." empty="No classes scheduled." onAdd={() => onAdd('schedule')} addLabel="Add class">
      {schedule.map(item => <ManagedRow key={item.id} title={item.title} detail={`${item.day} · ${item.time} · ${item.location}`} onDelete={() => onDelete(item.id)} />)}
    </ListCard>;
  }
  if (module === 'exams') {
    return <ListCard title="Examinations" description="Track every upcoming exam." empty="No exams added." onAdd={() => onAdd('exam')} addLabel="Add exam">
      {exams.map(item => <ManagedRow key={item.id} title={item.subject} detail={item.date} onDelete={() => onDelete(item.id)} />)}
    </ListCard>;
  }
  if (module === 'attendance') {
    return <ListCard title="Attendance" description="Track attendance and minimum requirements." empty="No courses tracked." onAdd={() => onAdd('attendance')} addLabel="Track course">
      {attendance.map(item => <ManagedRow key={item.id} title={item.course} detail={`${item.present}/${item.total} classes · ${item.total ? Math.round(item.present / item.total * 100) : 0}% (target ${item.target}%)`} onDelete={() => onDelete(item.id)} />)}
    </ListCard>;
  }
  if (module === 'performance') {
    const points = { A: 4, 'A-': 3.7, B: 3, 'B+': 3.3, 'B-': 2.7, C: 2, D: 1, F: 0 };
    const gpa = grades.length ? (grades.reduce((sum, item) => sum + (points[item.grade.toUpperCase() as keyof typeof points] ?? 0) * item.credits, 0) / Math.max(grades.reduce((sum, item) => sum + item.credits, 0), 1)).toFixed(2) : '—';
    return <ListCard title="Academic performance" description={`Current GPA: ${gpa}`} empty="No results added." onAdd={() => onAdd('grade')} addLabel="Add result">
      {grades.map(item => <ManagedRow key={item.id} title={item.subject} detail={`${item.grade} · ${item.credits} credits`} onDelete={() => onDelete(item.id)} />)}
    </ListCard>;
  }
  return <ListCard title="Notes & resources" description="Keep your study material in one place." empty="No notes yet." onAdd={() => onAdd('note')} addLabel="Add note">
    {notes.map(item => <ManagedRow key={item.id} title={item.title} detail={`${item.subject}${item.content ? ` · ${item.content}` : ''}`} onDelete={() => onDelete(item.id)} />)}
  </ListCard>;
}

function ListCard({ title, description, empty, children, onAdd, addLabel }: { title: string; description: string; empty: string; children: React.ReactNode; onAdd: () => void; addLabel: string }) {
  return <View><View style={styles.moduleCard}><Text style={styles.moduleTitle}>{title}</Text><Text style={styles.moduleDescription}>{description}</Text>{children || <Text style={styles.emptyText}>{empty}</Text>}</View><Pressable style={styles.addActivityButton} onPress={onAdd}><Text style={styles.addActivityIcon}>＋</Text><Text style={styles.addActivityText}>{addLabel}</Text></Pressable></View>;
}

function ManagedRow({ title, detail, completed, onPress, onDelete }: { title: string; detail: string; completed?: boolean; onPress?: () => void; onDelete: () => void }) {
  return <View style={styles.managedRow}><Pressable style={styles.managedMain} onPress={onPress}><View style={[styles.moduleBullet, completed && styles.checkboxDone]}>{completed && <Text style={styles.checkmark}>✓</Text>}</View><View style={styles.flex}><Text style={[styles.moduleRowText, completed && styles.taskDone]}>{title}</Text><Text style={styles.managedDetail}>{detail}</Text></View></Pressable><Pressable onPress={onDelete} accessibilityLabel={`Delete ${title}`}><Text style={styles.deleteText}>×</Text></Pressable></View>;
}
