import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors, styles } from '../styles';
import { useTheme } from './ThemeProvider';
import { AttendanceRecord, Exam, ScheduleItem, Task, ModuleKey } from '../types';
import { getNextClass } from '../utils/schedule';

export function Dashboard({
  tasks,
  schedule,
  exams,
  attendance,
  onToggleTask,
  onOpenModule,
  onAddTask,
}: {
  tasks: Task[];
  schedule: ScheduleItem[];
  exams: Exam[];
  attendance: AttendanceRecord[];
  onToggleTask: (id: string) => void;
  onOpenModule: (module: ModuleKey) => void;
  onAddTask: () => void;
}) {
  const { isDark } = useTheme();

  const nextClass = getNextClass(schedule);

  const averageAttendance = attendance.length
    ? Math.round(attendance.reduce((sum, item) => sum + (item.total ? item.present / item.total : 0), 0) / attendance.length * 100)
    : 0;
  const completed = tasks.filter(task => task.completed).length;
  const nextExam = exams[0];

  return (
    <>
      <View style={styles.statsRow}>
        <StatCard value={`${averageAttendance}%`} label="Attendance" accent={colors.greenSoft} />
        <StatCard value={nextExam ? nextExam.date : '—'} label="Next exam" accent={colors.peach} />
        <StatCard value={`${completed}/${tasks.length}`} label="Tasks complete" accent={colors.blue} />
      </View>

      <View style={[styles.card, isDark && styles.darkCard]}>
        <View style={styles.cardHeading}>
          <View><Text style={[styles.cardTitle, isDark && styles.darkCardTitle]}>Next class</Text><Text style={[styles.cardSubtitle, isDark && styles.darkCardSubtitle]}>{nextClass ? `${nextClass.day} · ${nextClass.time}` : 'No more classes today'}</Text></View>
          <Pressable onPress={() => onOpenModule('schedule')}><Text style={styles.seeAll}>Manage</Text></Pressable>
        </View>
        {nextClass ? (
          <View style={styles.classRow}>
            <View style={styles.classIcon}><Text style={styles.classIconText}>{nextClass.title.substring(0, 2).toUpperCase()}</Text></View>
            <View style={styles.flex}><Text style={styles.className}>{nextClass.title}</Text><Text style={styles.classMeta}>{nextClass.location}</Text></View>
          </View>
        ) : <Text style={styles.emptyText}>Enjoy your free time!</Text>}
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressTop}><View><Text style={styles.progressKicker}>DAILY PROGRESS</Text><Text style={styles.progressTitle}>{tasks.length ? 'You are on a roll.' : 'Build your study plan.'}</Text></View><Text style={styles.progressPercent}>{tasks.length ? `${Math.round(completed / tasks.length * 100)}%` : '0%'}</Text></View>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: tasks.length ? `${completed / tasks.length * 100}%` : '0%' }]} /></View>
        <Text style={styles.progressCaption}>{tasks.length ? `${completed} of ${tasks.length} tasks complete` : 'Your progress will appear here'}</Text>
      </View>
    </>
  );
}

function StatCard({ value, label, accent }: { value: string; label: string; accent: string }) {
  return <View style={[styles.statCard, { backgroundColor: accent }]}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}
