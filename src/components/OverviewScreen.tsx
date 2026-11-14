import React, { useEffect } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors, styles as globalStyles } from '../styles';
import { useTheme } from './ThemeProvider';
import { AttendanceRecord, Exam, Task } from '../types';

type OverviewScreenProps = {
  tasks: Task[];
  attendance: AttendanceRecord[];
  exams: Exam[];
  onClose: () => void;
};

export function OverviewScreen({ tasks, attendance, exams, onClose }: OverviewScreenProps) {
  const { isDark } = useTheme();

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [onClose]);

  // Basic stats
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const pendingTasks = totalTasks - completedTasks;
  const avgAttendance = attendance.length
    ? Math.round(attendance.reduce((sum, item) => sum + (item.total ? item.present / item.total : 0), 0) / attendance.length * 100)
    : 0;

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkSafeArea]}>
      <View style={styles.header}>
        <Pressable style={[styles.backButton, isDark && styles.darkButton]} onPress={onClose}>
          <Text style={[styles.backText, isDark && styles.darkMuted]}>‹</Text>
        </Pressable>
        <Text style={[styles.headerTitle, isDark && styles.darkText]}>Overview</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={globalStyles.content}>
        {/* Centered Large Pie Chart */}
        <View style={{ alignItems: 'center', marginVertical: 30 }}>
          <Svg width="220" height="220" viewBox="0 0 32 32">
            <Path fill={colors.greenSoft} d="M16 0 A16 16 0 0 1 32 16 L 16 16 Z" />
            <Path fill={colors.green} d="M32 16 A16 16 0 0 1 16 32 L 16 16 Z" />
            <Path fill={colors.yellow} d="M16 32 A16 16 0 0 1 0 16 L 16 16 Z" />
            <Path fill={colors.peach} d="M0 16 A16 16 0 0 1 16 0 L 16 16 Z" />
          </Svg>

          {/* Legend below chart */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, marginTop: 24, paddingHorizontal: 20 }}>
            <LegendItem color={colors.greenSoft} label="Attendance" />
            <LegendItem color={colors.green} label="Completed" />
            <LegendItem color={colors.yellow} label="Exams" />
            <LegendItem color={colors.peach} label="Pending" />
          </View>
        </View>

        {/* Detailed Stats */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <StatBox label="Attendance" value={`${avgAttendance}%`} color={colors.greenSoft} />
          <StatBox label="Tasks Done" value={completedTasks.toString()} color={colors.green} />
          <StatBox label="Exams" value={exams.length.toString()} color={colors.yellow} />
          <StatBox label="Pending" value={pendingTasks.toString()} color={colors.peach} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  const { isDark } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, backgroundColor: color, borderRadius: 2 }} />
      <Text style={[globalStyles.cardSubtitle, isDark && globalStyles.darkCardSubtitle, { fontSize: 11 }]}>{label}</Text>
    </View>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  const { isDark } = useTheme();
  return (
    <View style={[{ backgroundColor: color, padding: 15, borderRadius: 15, width: '47%' }, isDark && { backgroundColor: color + '40' }]}>
      <Text style={[globalStyles.cardSubtitle, isDark && { color: '#ccc' }]}>{label}</Text>
      <Text style={[globalStyles.cardTitle, isDark && { color: '#fff' }, { fontSize: 20, marginTop: 5 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F8F5' },
  darkSafeArea: { backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingVertical: 14 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8EFEB', alignItems: 'center', justifyContent: 'center' },
  darkButton: { backgroundColor: '#171717' },
  backText: { color: '#2F6B56', fontSize: 32, lineHeight: 34, fontWeight: '300', marginTop: -5, textAlign: 'center', textAlignVertical: 'center' },
  darkMuted: { color: '#929292' },
  headerTitle: { color: '#18211F', fontSize: 20, fontWeight: '800' },
  darkText: { color: '#FFFFFF' },
  headerSpacer: { width: 40 },
});
