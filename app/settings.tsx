import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ColorPalette } from '@/constants/Colors';
import { useSettings } from '@/contexts/SettingsContext';
import { useColors } from '@/hooks/useColors';

export default function SettingsScreen() {
  const { settings, update } = useSettings();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [totalPointsText, setTotalPointsText] = useState(String(settings.totalPoints));
  const [minimumBidText, setMinimumBidText] = useState(String(settings.minimumBid));

  function handleTotalPointsBlur() {
    const n = parseInt(totalPointsText);
    if (!isNaN(n) && n > 0) {
      update({ totalPoints: n });
    } else {
      setTotalPointsText(String(settings.totalPoints));
    }
  }

  function handleMinimumBidBlur() {
    const n = parseInt(minimumBidText);
    if (!isNaN(n) && n >= 0) {
      update({ minimumBid: n });
    } else {
      setMinimumBidText(String(settings.minimumBid));
    }
  }

  const schemes: Array<{ key: 'light' | 'dark' | 'system'; label: string }> = [
    { key: 'light', label: 'Light' },
    { key: 'dark', label: 'Dark' },
    { key: 'system', label: 'System' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">

      {/* APPEARANCE */}
      <Text style={styles.sectionHeader}>Appearance</Text>
      <View style={styles.card}>
        <Text style={styles.rowLabel}>Theme</Text>
        <View style={styles.segmented}>
          {schemes.map(s => (
            <Pressable
              key={s.key}
              style={[styles.segment, settings.colorScheme === s.key && styles.segmentActive]}
              onPress={() => update({ colorScheme: s.key })}>
              <Text
                style={[
                  styles.segmentText,
                  settings.colorScheme === s.key && styles.segmentTextActive,
                ]}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* GAME RULES */}
      <Text style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>Game Rules</Text>
      <View style={styles.card}>
        <View style={styles.fieldGroup}>
          <Text style={styles.rowLabel}>Total Points</Text>
          <Text style={styles.rowHint}>Points available per round</Text>
          <TextInput
            style={styles.numInput}
            value={totalPointsText}
            onChangeText={setTotalPointsText}
            onBlur={handleTotalPointsBlur}
            keyboardType="numeric"
            returnKeyType="done"
            selectTextOnFocus
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.fieldGroup}>
          <Text style={styles.rowLabel}>Minimum Bid</Text>
          <Text style={styles.rowHint}>
            {settings.minimumBid === 0
              ? 'No minimum (0 = off)'
              : `Must bid \u2265 ${settings.minimumBid}`}
          </Text>
          <TextInput
            style={styles.numInput}
            value={minimumBidText}
            onChangeText={setMinimumBidText}
            onBlur={handleMinimumBidBlur}
            keyboardType="numeric"
            returnKeyType="done"
            selectTextOnFocus
          />
        </View>
      </View>
    </ScrollView>
  );
}

function makeStyles(c: ColorPalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.scaffoldBg,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 40,
    },
    sectionHeader: {
      fontSize: 11,
      color: c.onSurface,
      opacity: 0.5,
      fontFamily: 'Rubik',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginBottom: 8,
      marginLeft: 4,
    },
    sectionHeaderSpaced: {
      marginTop: 24,
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      gap: 12,
    },
    fieldGroup: {
      gap: 4,
    },
    rowLabel: {
      fontSize: 16,
      fontFamily: 'Rubik',
      color: c.onSurface,
      fontWeight: '600',
    },
    rowHint: {
      fontSize: 12,
      fontFamily: 'Rubik',
      color: c.onSurface,
      opacity: 0.5,
    },
    divider: {
      height: 1,
      backgroundColor: c.surfaceVariant,
    },
    numInput: {
      backgroundColor: c.scaffoldBg,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.surfaceVariant,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 20,
      fontWeight: '700',
      color: c.onSurface,
      fontFamily: 'Rubik',
      textAlign: 'center',
    },
    segmented: {
      flexDirection: 'row',
      backgroundColor: c.surfaceVariant,
      borderRadius: 10,
      padding: 3,
      gap: 3,
    },
    segment: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    segmentActive: {
      backgroundColor: c.primary,
    },
    segmentText: {
      fontSize: 14,
      color: c.onSurface,
      fontFamily: 'Rubik',
      opacity: 0.65,
    },
    segmentTextActive: {
      color: c.onPrimary,
      opacity: 1,
      fontWeight: '600',
    },
  });
}
