import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { colors, styles } from '../styles';
import { AttendanceRecord, Exam, Grade, Note, ScheduleItem, Task } from '../types';

export type CreateMode = 'task' | 'schedule' | 'exam' | 'attendance' | 'note' | 'grade';
export type NewItem = Task | ScheduleItem | Exam | AttendanceRecord | Note | Grade;

export function CreateItemModal({
  mode,
  visible,
  onClose,
  onSave,
}: {
  mode: CreateMode | null;
  visible: boolean;
  onClose: () => void;
  onSave: (item: NewItem) => void;
}) {
  const [values, setValues] = useState<string[]>(['', '', '', '']);

  useEffect(() => {
    if (visible) setValues(['', '', '', '']);
  }, [visible, mode]);

  if (!mode) return null;
  const config = {
    task: { title: 'New task', labels: ['Task name', 'Due when?'], placeholders: ['e.g. Finish physics lab report', 'Tomorrow'] },
    schedule: { title: 'New class', labels: ['Class name', 'Day', 'Time', 'Room'], placeholders: ['e.g. Physics II', 'Monday', '10:30 AM', 'Room B204'] },
    exam: { title: 'New exam', labels: ['Subject', 'Exam date'], placeholders: ['e.g. Linear Algebra', '12 June 2024'] },
    attendance: { title: 'Track a course', labels: ['Course', 'Classes attended', 'Total classes', 'Minimum target %'], placeholders: ['e.g. Physics II', '8', '10', '75'] },
    note: { title: 'New note', labels: ['Note title', 'Subject', 'Details'], placeholders: ['e.g. Integration formulas', 'Calculus III', 'Write a quick summary...'] },
    grade: { title: 'Add result', labels: ['Subject', 'Grade', 'Credits'], placeholders: ['e.g. Physics II', 'A', '3'] },
  }[mode];

  const update = (index: number, value: string) => {
    setValues(current => current.map((item, itemIndex) => itemIndex === index ? value : item));
  };
  const save = () => {
    if (!values[0].trim()) return;
    const id = `${mode}-${Date.now()}`;
    if (mode === 'task') onSave({ id, title: values[0].trim(), due: values[1].trim() || 'Today', category: 'Assignment', completed: false });
    if (mode === 'schedule') onSave({ id, title: values[0].trim(), day: values[1] || 'Today', time: values[2] || 'All day', location: values[3] || 'TBD' });
    if (mode === 'exam') onSave({ id, subject: values[0].trim(), date: values[1].trim() || 'Date to be set' });
    if (mode === 'attendance') onSave({ id, course: values[0].trim(), present: Number(values[1]) || 0, total: Number(values[2]) || 0, target: Number(values[3]) || 75 });
    if (mode === 'note') onSave({ id, title: values[0].trim(), subject: values[1].trim() || 'General', content: values[2].trim() });
    if (mode === 'grade') onSave({ id, subject: values[0].trim(), grade: values[1].trim() || 'N/A', credits: Number(values[2]) || 0 });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View><Text style={styles.modalKicker}>STUDYOS</Text><Text style={styles.modalTitle}>{config.title}</Text></View>
            <Pressable onPress={onClose} accessibilityLabel="Close"><Text style={styles.modalClose}>×</Text></Pressable>
          </View>
          {config.labels.map((label, index) => (
            <View key={label}>
              <Text style={styles.inputLabel}>{label}</Text>
              <TextInput
                value={values[index]}
                onChangeText={value => update(index, value)}
                placeholder={config.placeholders[index]}
                placeholderTextColor={colors.muted}
                style={[styles.input, mode === 'note' && index === 2 && styles.multilineInput]}
                multiline={mode === 'note' && index === 2}
                keyboardType={mode === 'attendance' && index > 0 ? 'numeric' : 'default'}
              />
            </View>
          ))}
          <Pressable style={[styles.saveActivityButton, !values[0].trim() && styles.saveActivityButtonDisabled]} onPress={save} disabled={!values[0].trim()}>
            <Text style={styles.saveActivityText}>Save</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
