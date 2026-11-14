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
        {/* Pie Chart */}
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <Svg width="200" height="200" viewBox="0 0 32 32">
            <Path fill={colors.greenSoft} d="M16 0 A16 16 0 0 1 32 16 L 16 16 Z" />
            <Path fill={colors.green} d="M32 16 A16 16 0 0 1 16 32 L 16 16 Z" />
            <Path fill={colors.yellow} d="M16 32 A16 16 0 0 1 0 16 L 16 16 Z" />
            <Path fill={colors.peach} d="M0 16 A16 16 0 0 1 16 0 L 16 16 Z" />
          </Svg>
          <View style={{ marginTop: 20, gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 12, height: 12, backgroundColor: colors.greenSoft, borderRadius: 3 }} />
              <Text style={[globalStyles.cardSubtitle, isDark && globalStyles.darkCardSubtitle]}>Attendance ({avgAttendance}%)</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 12, height: 12, backgroundColor: colors.green, borderRadius: 3 }} />
              <Text style={[globalStyles.cardSubtitle, isDark && globalStyles.darkCardSubtitle]}>Tasks Completed ({completedTasks})</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 12, height: 12, backgroundColor: colors.yellow, borderRadius: 3 }} />
              <Text style={[globalStyles.cardSubtitle, isDark && globalStyles.darkCardSubtitle]}>Upcoming Exams ({exams.length})</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 12, height: 12, backgroundColor: colors.peach, borderRadius: 3 }} />
              <Text style={[globalStyles.cardSubtitle, isDark && globalStyles.darkCardSubtitle]}>Pending Tasks ({totalTasks - completedTasks})</Text>
            </View>
          </View>
        </View>

        <View style={[globalStyles.card, isDark && globalStyles.darkCard]}>
          <Text style={[globalStyles.cardTitle, isDark && globalStyles.darkCardTitle]}>Summary</Text>
          <Text style={[globalStyles.cardSubtitle, isDark && globalStyles.darkCardSubtitle, { marginTop: 10, lineHeight: 18 }]}>
            You have completed {completedTasks} out of {totalTasks} tasks.
            Your average attendance across all courses is {avgAttendance}%.
            You have {exams.length} upcoming exams.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
