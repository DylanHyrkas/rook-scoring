import { Text, View } from '@/components/Themed';
import { ColorPalette } from '@/constants/Colors';
import { useColors } from '@/hooks/useColors';
import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo } from 'react';
import { Pressable, SafeAreaView, StyleSheet } from 'react-native';

export default function HomeScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Settings Header */}
        <View style={styles.header}>
          <Link href="/settings" asChild>
            <Pressable style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}>
              <SymbolView
                name={{ ios: 'gearshape.fill', android: 'settings', web: 'settings' }}
                size={28}
                tintColor={colors.primary}
              />
            </Pressable>
          </Link>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Rook Scoring</Text>
          <Text style={styles.subtitle}>Keep score with ease</Text>

          {/* Start Button */}
          <View style={styles.buttonContainer}>
            <Link href="/game" asChild>
              <Pressable style={({ pressed }) => [styles.startButton, pressed && styles.buttonPressed]}>
                <Text style={styles.buttonText}>Start Game</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(c: ColorPalette) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.scaffoldBg,
    },
    container: {
      flex: 1,
      backgroundColor: c.scaffoldBg,
      paddingHorizontal: 24,
      paddingTop: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginBottom: 40,
    },
    settingsButton: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: 'transparent',
    },
    pressed: {
      opacity: 0.6,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 48,
      fontWeight: '700',
      color: c.primary,
      marginBottom: 8,
      fontFamily: 'Rubik',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: c.onSurface,
      opacity: 0.8,
      fontFamily: 'Rubik',
      textAlign: 'center',
      marginBottom: 32,
    },
    startButton: {
      backgroundColor: c.primary,
      paddingVertical: 18,
      paddingHorizontal: 40,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    buttonPressed: {
      opacity: 0.85,
    },
    buttonText: {
      fontSize: 18,
      fontWeight: '600',
      color: c.onPrimary,
      fontFamily: 'Rubik',
    },
    buttonContainer: {
      alignItems: 'center',
      marginBottom: 40,
    },
  });
}
