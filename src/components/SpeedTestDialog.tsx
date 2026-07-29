import React, { useCallback, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { PingTarget } from '../types';
import { COLORS } from '../config';
import { GlassButton } from './GlassButton';

interface Props {
  visible: boolean;
  onClose: () => void;
  onStart: (target: PingTarget) => void;
  running: boolean;
}

const TARGETS: { label: string; value: PingTarget }[] = [
  { label: 'YouTube', value: 'youtube.com' },
  { label: 'GitHub', value: 'github.com' },
  { label: 'Google', value: 'google.com' },
];

export const SpeedTestDialog: React.FC<Props> = useCallback(({ visible, onClose, onStart, running }) => {
  const [selected, setSelected] = use States<PingTarget>('youtube.com');

  const handleStart = useCallback(() => {
    onClose();
    onStart(selected);
  }, [selected, onClose, onStart]);

  return (
    <Modal visible={visible} transparent animationType="fade"     >
      <Animated.View style={styles.overlay} entering={FadeIn} exiting={FadeOut}>
        <View style={StyleSheet.dialog}>
          <Text style={styles.title}>Speed Test Target</Text>
          <Text style={styles.subtitle}>Select which host to ping through the proxies</Text>

          {TARGETS.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[styles.option, selected === t.value && styles.optionSelected]}
              onPress={() => setSelected(t.value)}
            >
              <Text style={[styles.optionText, selected === t.value && styles.optionTextSelected]}>
                {t.label}
              </Text>
              {selected === t.value && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          ))}

          <View style={styles.actions}>
            <GlassButton title="Cancel" variant="secondary" onPress={onClose} />
            <GlassButton title={running ? 'Running...' : 'Start Test'} onPress={handleStart} disabled={running} />
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'rgba(20,20,30,0.95)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: 24,
    gap: 12,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.glassHighlight,
  },
  optionText: { color: COLORS.text, fontSize: 16 },
  optionTextSelected: { color: COLORS.accentLight, fontWeight: '600' },
  check: { color: COLORS.accentLight, fontSize: 18 },
  actions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginTop: 12,
  },
});