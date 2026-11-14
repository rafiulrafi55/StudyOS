import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, styles } from '../styles';
import { AttendanceRecord, Exam, Grade, Note, ScheduleItem, Task } from '../types';
import { useTheme } from './ThemeProvider';

export type CreateMode = 'task' | 'schedule' | 'exam' | 'attendance' | 'note' | 'grade';
export type NewItem = Task | ScheduleItem | Exam | AttendanceRecord | Note | Grade;

type DatePickerField = 'task-due' | 'schedule-day' | 'schedule-time' | 'exam-date';

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
  const { isDark } = useTheme();
  const [values, setValues] = useState<string[]>(['', '', '', '']);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [pickerField, setPickerField] = useState<DatePickerField | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());

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

  const isDateField = (index: number): DatePickerField | null => {
    if (mode === 'task' && index === 1) return 'task-due';
    if (mode === 'schedule' && index === 1) return 'schedule-day';
    if (mode === 'schedule' && index === 2) return 'schedule-time';
    if (mode === 'exam' && index === 1) return 'exam-date';
    return null;
  };

  const update = (index: number, value: string) => {
    setValues(current => current.map((item, itemIndex) => itemIndex === index ? value : item));
  };

  const openDatePicker = (field: DatePickerField, modeType: 'date' | 'time') => {
    setPickerField(field);
    setPickerMode(modeType);
    const existing = values[config.labels.indexOf(config.labels.find((_, i) => isDateField(i) === field) ?? 0)];
    if (existing) {
      setTempDate(new Date(existing));
    } else {
      setTempDate(new Date());
    }
    setPickerVisible(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setPickerVisible(false);
    if (selectedDate && pickerField) {
      const fieldIndex = config.labels.findIndex((_, i) => isDateField(i) === pickerField);
      if (fieldIndex >= 0) {
        const isoString = selectedDate.toISOString();
        update(fieldIndex, isoString);
      }
    }
    setPickerField(null);
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

  const formatDisplay = (isoString: string, modeType: 'date' | 'time') => {
    try {
      const date = new Date(isoString);
      if (modeType === 'time') {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.modalCard, isDark && styles.darkModalCard]}>
          <View style={styles.modalHeader}>
            <View><Text style={styles.modalKicker}>STUDYOS</Text><Text style={[styles.modalTitle, isDark && styles.darkModalTitle]}>{config.title}</Text></View>
            <Pressable onPress={onClose} accessibilityLabel="Close"><Text style={styles.modalClose}>×</Text></Pressable>
          </View>
          {config.labels.map((label, index) => {
            const field = isDateField(index);
            const isTimeField = field === 'schedule-time';
            const displayValue = field && values[index] ? formatDisplay(values[index], isTimeField ? 'time' : 'date') : values[index];

            return (
              <View key={label}>
                <Text style={[styles.inputLabel, isDark && styles.darkInputLabel]}>{label}</Text>
                {field ? (
                  <Pressable
                    style={[styles.input, isDark && styles.darkInput, { justifyContent: 'center' }]}
                    onPress={() => openDatePicker(field, isTimeField ? 'time' : 'date')}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${label}`}
                  >
                    <Text style={[styles.datePickerText, { color: displayValue ? (isDark ? '#fff' : colors.ink) : colors.muted }]}>
                      {displayValue || config.placeholders[index]}
                    </Text>
                  </Pressable>
                ) : (
                  <TextInput
                    value={values[index]}
                    onChangeText={value => update(index, value)}
                    placeholder={config.placeholders[index]}
                    placeholderTextColor={colors.muted}
                    style={[styles.input, isDark && styles.darkInput, mode === 'note' && index === 2 && styles.multilineInput]}
                    multiline={mode === 'note' && index === 2}
                    keyboardType={mode === 'attendance' && index > 0 ? 'numeric' : 'default'}
                  />
                )}
              </View>
            );
          })}
          <Pressable style={[styles.saveActivityButton, !values[0].trim() && styles.saveActivityButtonDisabled]} onPress={save} disabled={!values[0].trim()}>
            <Text style={styles.saveActivityText}>Save</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* DateTimePicker Modal */}
      <Modal visible={pickerVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: isDark ? '#121212' : '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
            <DateTimePicker
              value={tempDate}
              mode={pickerMode}
              is24Hour={false}
              onChange={handleDateChange}
              display="default"
            />
          </View>
        </View>
      </Modal>
    </Modal>
  );
}