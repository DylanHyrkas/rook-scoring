import { Text, View } from '@/components/Themed';
import { ColorPalette } from '@/constants/Colors';
import { useSettings } from '@/contexts/SettingsContext';
import { useColors } from '@/hooks/useColors';
import { useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

type Round = {
  bidTeam: 'team1' | 'team2';
  bid: number;
  team1Points: number;
  team2Points: number;
  team1Delta: number;
  team2Delta: number;
  madeBid: boolean;
};

export default function GameScreen() {
  const { settings } = useSettings();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const TOTAL_POINTS = settings.totalPoints;
  const MINIMUM_BID = settings.minimumBid;

  const [team1Name, setTeam1Name] = useState('Team 1');
  const [team2Name, setTeam2Name] = useState('Team 2');
  const [editingTeam, setEditingTeam] = useState<'team1' | 'team2' | null>(null);

  const [rounds, setRounds] = useState<Round[]>([]);
  const [phase, setPhase] = useState<'bidding' | 'scoring'>('bidding');
  const [bidder, setBidder] = useState<'team1' | 'team2'>('team1');
  const [bidAmount, setBidAmount] = useState('');
  const [team1PointsInput, setTeam1PointsInput] = useState('');

  // Refs so step functions read latest value inside setInterval (no stale closures)
  const bidAmountRef = useRef(bidAmount);
  bidAmountRef.current = bidAmount;
  const team1PointsRef = useRef(team1PointsInput);
  team1PointsRef.current = team1PointsInput;
  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const team1Total = rounds.reduce((s, r) => s + r.team1Delta, 0);
  const team2Total = rounds.reduce((s, r) => s + r.team2Delta, 0);

  const t1Parsed = parseInt(team1PointsInput);
  const t2Computed = !isNaN(t1Parsed) ? TOTAL_POINTS - t1Parsed : null;

  const bidParsed = parseInt(bidAmount);
  const bidBelowMinimum =
    MINIMUM_BID > 0 && bidAmount !== '' && !isNaN(bidParsed) && bidParsed > 0 && bidParsed < MINIMUM_BID;

  function goToScoring() {
    const bid = parseInt(bidAmount);
    if (!bidAmount || isNaN(bid) || bid <= 0) return;
    setPhase('scoring');
  }

  function scoreRound() {
    const bid = parseInt(bidAmount);
    const t1 = parseInt(team1PointsInput);
    if (isNaN(t1) || t1 < 0 || t1 > TOTAL_POINTS) return;
    const t2 = TOTAL_POINTS - t1;

    const bidderPoints = bidder === 'team1' ? t1 : t2;
    const madeBid = bidderPoints >= bid;

    const team1Delta = bidder === 'team1' ? (madeBid ? t1 : -bid) : t1;
    const team2Delta = bidder === 'team2' ? (madeBid ? t2 : -bid) : t2;

    setRounds(prev => [
      ...prev,
      { bidTeam: bidder, bid, team1Points: t1, team2Points: t2, team1Delta, team2Delta, madeBid },
    ]);
    setBidAmount('');
    setTeam1PointsInput('');
    setPhase('bidding');
  }

  function undoLastRound() {
    if (rounds.length === 0) return;
    Alert.alert('Undo', `Remove round ${rounds.length}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Undo', style: 'destructive', onPress: () => setRounds(prev => prev.slice(0, -1)) },
    ]);
  }

  function confirmNewGame() {
    Alert.alert('New Game', 'Clear all scores and start over?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'New Game',
        style: 'destructive',
        onPress: () => {
          setRounds([]);
          setBidAmount('');
          setTeam1PointsInput('');
          setPhase('bidding');
          setBidder('team1');
        },
      },
    ]);
  }

  function stepBid(delta: number) {
    const current = parseInt(bidAmountRef.current) || 0;
    const next = Math.max(5, current + delta);
    setBidAmount(String(next));
  }

  function stepPoints(delta: number) {
    const current = parseInt(team1PointsRef.current) || 0;
    const next = Math.max(0, Math.min(TOTAL_POINTS, current + delta));
    setTeam1PointsInput(String(next));
  }

  function startHold(fn: () => void) {
    fn();
    holdRef.current = setInterval(fn, 120);
  }

  function stopHold() {
    if (holdRef.current !== null) {
      clearInterval(holdRef.current);
      holdRef.current = null;
    }
  }

  const bidderName = bidder === 'team1' ? team1Name : team2Name;
  const enterDisabled = !bidAmount || isNaN(bidParsed) || bidParsed <= 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">

      {/* Scoreboard */}
      <View style={styles.scoreboard}>
        <View style={styles.teamBlock}>
          {editingTeam === 'team1' ? (
            <TextInput
              style={styles.teamNameInput}
              value={team1Name}
              onChangeText={setTeam1Name}
              onBlur={() => setEditingTeam(null)}
              autoFocus
              selectTextOnFocus
            />
          ) : (
            <Pressable onPress={() => setEditingTeam('team1')}>
              <Text style={styles.teamNameText}>{team1Name}</Text>
            </Pressable>
          )}
          <Text style={[styles.totalScore, team1Total < 0 && styles.negScore]}>
            {team1Total}
          </Text>
        </View>

        <View style={styles.scoreboardDivider}>
          <Text style={styles.dividerText}>—</Text>
        </View>

        <View style={styles.teamBlock}>
          {editingTeam === 'team2' ? (
            <TextInput
              style={styles.teamNameInput}
              value={team2Name}
              onChangeText={setTeam2Name}
              onBlur={() => setEditingTeam(null)}
              autoFocus
              selectTextOnFocus
            />
          ) : (
            <Pressable onPress={() => setEditingTeam('team2')}>
              <Text style={styles.teamNameText}>{team2Name}</Text>
            </Pressable>
          )}
          <Text style={[styles.totalScore, team2Total < 0 && styles.negScore]}>
            {team2Total}
          </Text>
        </View>
      </View>

      {/* Round Input Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Round {rounds.length + 1}</Text>

        {phase === 'bidding' ? (
          <>
            <Text style={styles.inputLabel}>Who bid?</Text>
            <View style={styles.segmented}>
              {(['team1', 'team2'] as const).map(team => (
                <Pressable
                  key={team}
                  style={[styles.segment, bidder === team && styles.segmentActive]}
                  onPress={() => setBidder(team)}>
                  <Text style={[styles.segmentText, bidder === team && styles.segmentTextActive]}>
                    {team === 'team1' ? team1Name : team2Name}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Bid amount</Text>
            <View style={styles.stepperContainer}>
              <TextInput
                style={styles.numInput}
                value={bidAmount}
                onChangeText={setBidAmount}
                placeholder="—"
                placeholderTextColor={colors.onSurface + '40'}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={goToScoring}
              />
              <View style={styles.stepperButtons}>
                <Pressable
                  style={styles.stepButton}
                  onPressIn={() => startHold(() => stepBid(-5))}
                  onPressOut={stopHold}>
                  <Text style={styles.stepButtonText}>−5</Text>
                </Pressable>
                <Pressable
                  style={styles.stepButton}
                  onPressIn={() => startHold(() => stepBid(5))}
                  onPressOut={stopHold}>
                  <Text style={styles.stepButtonText}>+5</Text>
                </Pressable>
              </View>
            </View>
            {bidBelowMinimum && (
              <Text style={styles.bidWarning}>Bid is below minimum of {MINIMUM_BID}</Text>
            )}

            <Pressable
              style={[styles.primaryButton, enterDisabled && styles.buttonDisabled]}
              onPress={goToScoring}
              disabled={enterDisabled}>
              <Text style={styles.primaryButtonText}>Enter Points →</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.bidBadge}>
              <Text style={styles.bidBadgeText}>{bidderName} bid {bidAmount}</Text>
            </View>

            <Text style={styles.inputLabel}>Points {team1Name} took</Text>
            <View style={styles.stepperContainer}>
              <TextInput
                style={styles.numInput}
                value={team1PointsInput}
                onChangeText={v => {
                  const n = parseInt(v);
                  if (v === '' || (!isNaN(n) && n >= 0 && n <= TOTAL_POINTS)) {
                    setTeam1PointsInput(v);
                  }
                }}
                placeholder="0"
                placeholderTextColor={colors.onSurface + '40'}
                keyboardType="numeric"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={scoreRound}
              />
              <View style={styles.stepperButtons}>
                <Pressable
                  style={styles.stepButton}
                  onPressIn={() => startHold(() => stepPoints(-5))}
                  onPressOut={stopHold}>
                  <Text style={styles.stepButtonText}>−5</Text>
                </Pressable>
                <Pressable
                  style={styles.stepButton}
                  onPressIn={() => startHold(() => stepPoints(5))}
                  onPressOut={stopHold}>
                  <Text style={styles.stepButtonText}>+5</Text>
                </Pressable>
              </View>
            </View>
            {t2Computed !== null && (
              <Text style={styles.pointsAutoHint}>
                {team2Name}: {t2Computed}
              </Text>
            )}

            {/* Preview result */}
            {team1PointsInput !== '' && t2Computed !== null && (
              <View style={styles.previewRow}>
                {(() => {
                  const bid = parseInt(bidAmount);
                  const t1 = t1Parsed;
                  const t2 = t2Computed;
                  const bidderPts = bidder === 'team1' ? t1 : t2;
                  const made = bidderPts >= bid;
                  const d1 = bidder === 'team1' ? (made ? t1 : -bid) : t1;
                  const d2 = bidder === 'team2' ? (made ? t2 : -bid) : t2;
                  return (
                    <>
                      <Text style={[styles.previewResult, made ? styles.madeText : styles.setText]}>
                        {made ? '✓ Makes it' : '✗ Set!'}
                      </Text>
                      <View style={styles.previewDeltas}>
                        <Text style={[styles.previewDelta, d1 < 0 && styles.negScore]}>
                          {d1 > 0 ? '+' : ''}{d1}
                        </Text>
                        <Text style={styles.previewDeltaSep}>·</Text>
                        <Text style={[styles.previewDelta, d2 < 0 && styles.negScore]}>
                          {d2 > 0 ? '+' : ''}{d2}
                        </Text>
                      </View>
                    </>
                  );
                })()}
              </View>
            )}

            <Pressable
              style={[styles.primaryButton, !team1PointsInput && styles.buttonDisabled]}
              onPress={scoreRound}
              disabled={!team1PointsInput}>
              <Text style={styles.primaryButtonText}>Score Round</Text>
            </Pressable>

            <Pressable style={styles.ghostButton} onPress={() => setPhase('bidding')}>
              <Text style={styles.ghostButtonText}>← Back to Bid</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* History */}
      {rounds.length > 0 && (
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>History</Text>
            <View style={styles.historyActions}>
              <Pressable onPress={undoLastRound}>
                <Text style={styles.undoText}>Undo</Text>
              </Pressable>
              <Text style={styles.historyActionSep}>·</Text>
              <Pressable onPress={confirmNewGame}>
                <Text style={styles.newGameText}>New Game</Text>
              </Pressable>
            </View>
          </View>

          {[...rounds].reverse().map((round, idx) => {
            const num = rounds.length - idx;
            const bidTeamName = round.bidTeam === 'team1' ? team1Name : team2Name;
            return (
              <View
                key={idx}
                style={[styles.historyRow, round.madeBid ? styles.madeRow : styles.setRow]}>
                <View style={styles.historyLeft}>
                  <Text style={styles.historyRoundNum}>Round {num}</Text>
                  <Text style={styles.historyDetail}>
                    {bidTeamName} bid {round.bid}{'  '}
                    <Text style={round.madeBid ? styles.madeText : styles.setText}>
                      {round.madeBid ? '✓ made' : '✗ set'}
                    </Text>
                  </Text>
                  <Text style={styles.historyPoints}>
                    {team1Name}: {round.team1Points} · {team2Name}: {round.team2Points}
                  </Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={[styles.historyDelta, round.team1Delta < 0 && styles.negScore]}>
                    {round.team1Delta > 0 ? '+' : ''}{round.team1Delta}
                  </Text>
                  <Text style={[styles.historyDelta, round.team2Delta < 0 && styles.negScore]}>
                    {round.team2Delta > 0 ? '+' : ''}{round.team2Delta}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
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
      paddingTop: 12,
      paddingBottom: 40,
      gap: 14,
    },

    // --- Scoreboard ---
    scoreboard: {
      flexDirection: 'row',
      backgroundColor: c.surface,
      borderRadius: 16,
      paddingVertical: 20,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    teamBlock: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    teamNameText: {
      fontSize: 17,
      fontWeight: '600',
      color: c.onSurface,
      fontFamily: 'Rubik',
      textAlign: 'center',
      opacity: 0.75,
    },
    teamNameInput: {
      fontSize: 17,
      fontWeight: '600',
      color: c.onSurface,
      fontFamily: 'Rubik',
      textAlign: 'center',
      backgroundColor: c.surfaceVariant,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 5,
      minWidth: 80,
      maxWidth: 120,
      alignSelf: 'center',
    },
    totalScore: {
      fontSize: 52,
      fontWeight: '700',
      color: c.primary,
      fontFamily: 'Rubik',
      marginTop: 2,
      textAlign: 'center',
    },
    negScore: {
      color: '#EF5350',
    },
    scoreboardDivider: {
      backgroundColor: 'transparent',
      paddingHorizontal: 8,
    },
    dividerText: {
      fontSize: 22,
      color: c.surfaceVariant,
      fontFamily: 'Rubik',
    },

    // --- Card ---
    card: {
      backgroundColor: c.surface,
      borderRadius: 12,
      padding: 20,
      gap: 10,
    },
    cardTitle: {
      fontSize: 12,
      color: c.onSurface,
      opacity: 0.5,
      fontFamily: 'Rubik',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginBottom: 2,
    },
    inputLabel: {
      fontSize: 13,
      color: c.onSurface,
      opacity: 0.65,
      fontFamily: 'Rubik',
      marginTop: 6,
    },

    // --- Segmented control ---
    segmented: {
      flexDirection: 'row',
      backgroundColor: c.surfaceVariant,
      borderRadius: 12,
      padding: 3,
      gap: 3,
    },
    segment: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    segmentActive: {
      backgroundColor: c.primary,
    },
    segmentText: {
      fontSize: 15,
      color: c.onSurface,
      fontFamily: 'Rubik',
      opacity: 0.65,
    },
    segmentTextActive: {
      color: c.onPrimary,
      opacity: 1,
      fontWeight: '600',
    },

    // --- Inputs ---
    numInput: {
      backgroundColor: c.scaffoldBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.surfaceVariant,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 36,
      fontWeight: '700',
      color: c.onSurface,
      fontFamily: 'Rubik',
      textAlign: 'center',
    },
    stepperContainer: {
      backgroundColor: c.surfaceVariant,
      borderRadius: 12,
      padding: 4,
      gap: 4,
    },
    stepperButtons: {
      flexDirection: 'row',
      gap: 4,
      borderRadius: 12
    },
    stepButton: {
      flex: 1,
      backgroundColor: 'transparent',
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepButtonText: {
      fontSize: 17,
      fontWeight: '700',
      color: c.primary,
      fontFamily: 'Rubik',
    },
    bidWarning: {
      fontSize: 13,
      color: '#EF5350',
      fontFamily: 'Rubik',
      textAlign: 'center',
      marginTop: -4,
    },

    pointsAutoHint: {
      fontSize: 14,
      color: c.onSurface,
      opacity: 0.55,
      fontFamily: 'Rubik',
      textAlign: 'center',
      marginTop: -2,
    },

    // --- Bid badge ---
    bidBadge: {
      backgroundColor: c.primary + '1A',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.primary + '40',
    },
    bidBadgeText: {
      fontSize: 15,
      color: c.primary,
      fontFamily: 'Rubik',
      fontWeight: '600',
    },

    // --- Preview result ---
    previewRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: c.surfaceVariant,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    previewResult: {
      fontSize: 15,
      fontFamily: 'Rubik',
      fontWeight: '600',
    },
    previewDeltas: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: 'transparent',
    },
    previewDelta: {
      fontSize: 17,
      fontWeight: '700',
      color: c.onSurface,
      fontFamily: 'Rubik',
    },
    previewDeltaSep: {
      fontSize: 14,
      color: c.onSurface,
      opacity: 0.4,
      fontFamily: 'Rubik',
    },
    madeText: {
      color: '#66BB6A',
    },
    setText: {
      color: '#EF5350',
    },

    // --- Buttons ---
    primaryButton: {
      backgroundColor: c.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 2,
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 4,
    },
    buttonDisabled: {
      backgroundColor: c.surfaceVariant,
      shadowOpacity: 0,
      elevation: 0,
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: c.onPrimary,
      fontFamily: 'Rubik',
    },
    ghostButton: {
      paddingVertical: 8,
      alignItems: 'center',
    },
    ghostButtonText: {
      fontSize: 14,
      color: c.onSurface,
      opacity: 0.5,
      fontFamily: 'Rubik',
    },

    // --- History ---
    historySection: {
      gap: 8,
      backgroundColor: 'transparent',
    },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'transparent',
      marginBottom: 2,
    },
    historyTitle: {
      fontSize: 12,
      color: c.onSurface,
      opacity: 0.5,
      fontFamily: 'Rubik',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    historyActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: 'transparent',
    },
    undoText: {
      fontSize: 14,
      color: c.onSurface,
      opacity: 0.55,
      fontFamily: 'Rubik',
    },
    historyActionSep: {
      fontSize: 14,
      color: c.onSurface,
      opacity: 0.3,
      fontFamily: 'Rubik',
    },
    newGameText: {
      fontSize: 14,
      color: '#EF5350',
      fontFamily: 'Rubik',
    },
    historyRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 12,
      padding: 14,
      borderLeftWidth: 3,
      borderLeftColor: 'transparent',
    },
    madeRow: {
      borderLeftColor: '#66BB6A',
    },
    setRow: {
      borderLeftColor: '#EF5350',
    },
    historyLeft: {
      flex: 1,
      backgroundColor: 'transparent',
      gap: 3,
    },
    historyRoundNum: {
      fontSize: 11,
      color: c.onSurface,
      opacity: 0.4,
      fontFamily: 'Rubik',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    historyDetail: {
      fontSize: 15,
      color: c.onSurface,
      fontFamily: 'Rubik',
      fontWeight: '600',
    },
    historyPoints: {
      fontSize: 12,
      color: c.onSurface,
      opacity: 0.45,
      fontFamily: 'Rubik',
    },
    historyRight: {
      alignItems: 'flex-end',
      gap: 4,
      backgroundColor: 'transparent',
    },
    historyDelta: {
      fontSize: 18,
      fontWeight: '700',
      color: c.onSurface,
      fontFamily: 'Rubik',
    },
  });
}
