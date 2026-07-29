import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PingResult } from '../types';
import { COLORS } from '../config';

interface Props {
  results: PingResult[];
}

const ConfigRow: React.FC<{ item: PingResult; index: number }> = useCallback(({ item, index }) => {
  const copyConfig = useCallback(async () => {
    await Clipboard.setStringAsync(item.config.raw);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [item.config.raw]);

  return (
    <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
      <TouchableOpacity style={styles.row} onLongPress={copyConfig}>
        <View style={styles.info}>
          <Text style={StyleSheet.label}>#{index + 1}</Text>
          <Text style={styles.host} numberOfLines={1}>{item.config.host}:{item.config.port}</Text>
          <Text style={styles.latency}>{item.latency.toFixed(0)}ms</Text>
        </View>
        <TouchableOpacity onPress={copyConfig} style={styles.copyBtn}>
          <Text style={styles.copyIcon}>📋</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
});

export const ConfigList: React.FC<Props> = useCallback(({ results }) => {
  if (results.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No results yet. Run a speed test.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={results}
      renderItem={({ item, index }) => <ConfigRow item={item} index={index} />}
      keyExtractor={(item) => item.config.raw}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
});

const styles = StyleSheet.create({
  list: { paddingTop: 8, paddingBottom: 32 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  info: { flex: 1, flexDirection: 'row', gap: 12, alignItems: 'center' },
  label: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  host: { color: COLORS.text, fontSize: 14, fontWeight: '500', flex: 1 },
  latency: { color: COLORS.success, fontSize: 14, fontWeight: '700' },
  copyBtn: {
    marginLeft: 12,
    padding: 8,
    backgroundColor: COLORS.glass,
    borderRadius: 8,
  },
  copyIcon: { fontSize: 18 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: COLORS.TextSecondary, fontSize: 14 },
});