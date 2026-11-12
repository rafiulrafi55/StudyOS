export type ModuleKey =
  | 'home'
  | 'schedule'
  | 'assignments'
  | 'exams'
  | 'attendance'
  | 'focus'
  | 'performance'
  | 'notes';

export type Module = {
  key: ModuleKey;
  label: string;
  icon: string;
};

export type ModuleContent = {
  title: string;
  description: string;
  rows: string[];
};

export type Task = {
  id: string;
  title: string;
  category: 'Assignment' | 'Study';
  due: string;
  completed: boolean;
};

export type ScheduleItem = { id: string; title: string; day: string; time: string; location: string };
export type Exam = { id: string; subject: string; date: string };
export type AttendanceRecord = { id: string; course: string; present: number; total: number; target: number };
export type Note = { id: string; title: string; subject: string; content: string };
export type Grade = { id: string; subject: string; grade: string; credits: number };
