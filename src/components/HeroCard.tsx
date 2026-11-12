import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from '../styles';

export function HeroCard({ onStartFocus }: { onStartFocus: () => void }) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroCopy}>
        <Text style={styles.heroKicker}>YOUR DAY AT A GLANCE</Text>
        <Text style={styles.heroTitle}>Make today{'\n'}count.</Text>
        <Text style={styles.heroBody}>Plan your classes, tasks, exams, and study time in one place.</Text>
        <Pressable style={styles.primaryButton} onPress={onStartFocus}>
          <Text style={styles.primaryButtonText}>Start a focus session</Text>
          <Text style={styles.buttonArrow}>→</Text>
        </Pressable>
      </View>
      <View style={styles.heroShape}>
        <Text style={styles.heroShapeText}>✦</Text>
        <View style={styles.heroDot} />
      </View>
    </View>
  );
}
