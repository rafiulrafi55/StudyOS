import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { modules } from '../data/modules';
import { styles } from '../styles';
import { ModuleKey } from '../types';

export function BottomTabBar({
  activeModule,
  onSelect,
}: {
  activeModule: ModuleKey;
  onSelect: (module: ModuleKey) => void;
}) {
  return (
    <View style={styles.tabBar}>
      {modules.slice(0, 5).map(module => {
        const selected = activeModule === module.key;
        return (
          <Pressable
            key={module.key}
            style={styles.tab}
            onPress={() => onSelect(module.key)}
            accessibilityRole="button"
            accessibilityState={{ selected }}>
            <Text style={[styles.tabIcon, selected && styles.tabIconSelected]}>{module.icon}</Text>
            <Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>{module.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
