import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Colors, Fonts, Radius } from '../../constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');

/* ── DATA ─────────────────────────────────────────────────── */
const stats = [
  { icon: '📞', value: '45,000+', label: 'Scam Calls Daily', sub: 'Targeting Indian mobile users', color: Colors.red },
  { icon: '🎣', value: '12 Lakh', label: 'Phishing Attacks', sub: 'Reported in 2023 alone', color: Colors.amber },
  { icon: '💸', value: '₹11,000 Cr', label: 'Financial Losses', sub: 'Cyber fraud in India (2023)', color: Colors.cyan },
];

const scamTypes = [
  { icon: '🔢', title: 'OTP Scam', desc: 'Fraudsters impersonate banks and trick you into sharing your OTP to drain accounts.', risk: 'HIGH' },
  { icon: '📋', title: 'KYC Scam', desc: 'Fake KYC update requests via SMS, WhatsApp, or calls pressuring you to reveal account details.', risk: 'HIGH' },
  { icon: '💳', title: 'UPI Fraud', desc: 'Fake payment requests or QR codes sent to steal money from your UPI-linked bank account.', risk: 'HIGH' },
  { icon: '👮', title: 'Digital Arrest', desc: 'Criminals impersonate police or CBI officials via video call to extort money through fear.', risk: 'CRITICAL' },
  { icon: '📦', title: 'Courier Scam', desc: 'Fake notifications about held parcels containing illegal items to extract personal and banking info.', risk: 'MEDIUM' },
  { icon: '🏦', title: 'Fake Banking Calls', desc: 'Callers posing as bank executives offering loans, rewards, or resolving fake account issues.', risk: 'HIGH' },
];

const steps = [
  { num: '01', icon: '🗣️', title: 'Describe the Situation', desc: 'Tell us what happened — a suspicious call, message, or online interaction. No login needed.' },
  { num: '02', icon: '🧠', title: 'AI Risk Analysis', desc: 'Our engine cross-references 50+ known scam patterns against your description to calculate a threat score.' },
  { num: '03', icon: '✅', title: 'Get Safety Guidance', desc: 'Receive clear, plain-language advice on what to do next — whether to ignore, block, or report.' },
];

const privacyPoints = [
  { icon: '🚫', title: 'No Login Required', desc: 'Use the full tool anonymously. We never ask for your name, phone number, or any personal details.' },
  { icon: '🎙️', title: 'No Call Recording', desc: 'We never listen to or record any calls. You describe the situation in your own words.' },
  { icon: '🗑️', title: 'Data Auto-Deleted', desc: 'All session data is cleared automatically when you close the app. Nothing is stored on our servers.' },
  { icon: '🔐', title: 'Privacy-First Processing', desc: 'Your inputs are analyzed locally and are never shared with third parties.' },
];

const riskBadgeColor: Record<string, string> = {
  HIGH: Colors.red,
  CRITICAL: Colors.redDark,
  MEDIUM: Colors.amber,
};

/* ── MINI CALCULATOR ──────────────────────────────────────── */
const miniQuestions = [
  { id: 'q0', question: 'Did an unknown person contact you?' },
  { id: 'q1', question: 'Did they claim to be an official — Government, Police, Bank, CBI, Courier, Loan, Customs etc?' },
  { id: 'q2', question: 'Did they mention something unexpected — fake loan, arrest, parcel, KYC, or fake refund?' },
  { id: 'q3', question: 'Did they ask for Money, OTP, PIN, CVV, bank details, or Credit/Debit card details?' },
  { id: 'q4', question: 'Did they send a suspicious link, app download, QR code, or payment request?' },
];

interface RiskResult {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
  percent: number;
  advice: string;
}

function getMiniRisk(score: number): RiskResult {
  const percent = score * 20;
  if (score >= 4) return { label: 'CRITICAL RISK', color: Colors.redDark, bg: 'rgba(185,28,28,0.12)', border: 'rgba(185,28,28,0.35)', icon: '🚨', percent, advice: 'Very likely a scam. Do not share anything. Call Cyber Crime Helpline on 1930 immediately. Report at cybercrime.gov.in.' };
  if (score >= 3) return { label: 'HIGH RISK', color: Colors.red, bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.35)', icon: '⚠️', percent, advice: 'Likely a scam. Disconnect and report on cybercrime.gov.in.' };
  if (score >= 2) return { label: 'MEDIUM RISK', color: Colors.amber, bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.35)', icon: '🔍', percent, advice: 'Some risk signs. Verify the phone number and ID independently before acting.' };
  return { label: 'LOW RISK', color: Colors.green, bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.35)', icon: '✅', percent, advice: "This doesn't appear to be a scam for now. Stay cautious." };
}

function MiniCalculator() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<RiskResult | null>(null);

  const answered = Object.keys(answers).length;
  const complete = answered === miniQuestions.length;

  const handleSelect = (qid: string, val: string) => {
    setAnswers(prev => ({ ...prev, [qid]: val }));
  };

  const handleCheck = () => {
    const score = Object.values(answers).filter(v => v === 'yes').length;
    setResult(getMiniRisk(score));
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
  };

  const yesCount = Object.values(answers).filter(v => v === 'yes').length;

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <View style={miniStyles.container}>
      {/* Header */}
      <View style={miniStyles.header}>
        <View style={{ flex: 1 }}>
          <Text style={miniStyles.title}>⚡ Quick Risk Check</Text>
          <Text style={miniStyles.sub}>5 yes/no questions · ~20 seconds</Text>
        </View>
        <TouchableOpacity style={miniStyles.resetBtn} onPress={handleReset}>
          <Text style={miniStyles.resetBtnText}>↻ Reset</Text>
        </TouchableOpacity>
      </View>

      {result ? (
        /* Result */
        <View style={[miniStyles.resultBox, { borderColor: result.border, backgroundColor: result.bg }]}>
          <View style={miniStyles.resultTop}>
            <Text style={miniStyles.resultIcon}>{result.icon}</Text>
            <View>
              <Text style={[miniStyles.resultLabel, { color: result.color }]}>{result.label}</Text>
              <Text style={[miniStyles.resultPercent, { color: result.color }]}>{result.percent}%</Text>
            </View>
          </View>
          <Text style={miniStyles.resultAdvice}>{result.advice}</Text>
          <View style={{ gap: 8, marginTop: 12 }}>
            {yesCount >= 3 && (
              <TouchableOpacity
                style={miniStyles.reportBtn}
                onPress={() => Linking.openURL('https://cybercrime.gov.in')}
              >
                <Text style={miniStyles.reportBtnText}>📋 Report on cybercrime.gov.in</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={miniStyles.tryAgainBtn} onPress={handleReset}>
              <Text style={miniStyles.tryAgainBtnText}>↩ Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          {/* Progress */}
          <View style={miniStyles.progressRow}>
            <View style={miniStyles.progressTrack}>
              <View style={[miniStyles.progressFill, { width: `${(answered / miniQuestions.length) * 100}%` as any }]} />
            </View>
            <Text style={miniStyles.progressCount}>{answered}/5</Text>
          </View>

          {/* Questions */}
          {miniQuestions.map((q, i) => (
            <View
              key={q.id}
              style={[
                miniStyles.questionCard,
                answers[q.id] !== undefined && miniStyles.questionCardAnswered,
              ]}
            >
              <Text style={miniStyles.qNumber}>QUESTION {i + 1} OF {miniQuestions.length}</Text>
              <Text style={miniStyles.qText}>{q.question}</Text>
              <View style={miniStyles.radioRow}>
                {(['yes', 'no'] as const).map(val => {
                  const selected = answers[q.id] === val;
                  return (
                    <TouchableOpacity
                      key={val}
                      style={[miniStyles.radioBtn, selected && miniStyles.radioBtnSelected]}
                      onPress={() => handleSelect(q.id, val)}
                    >
                      <View style={[miniStyles.radioDot, selected && miniStyles.radioDotSelected]}>
                        {selected && <View style={miniStyles.radioDotInner} />}
                      </View>
                      <Text style={[miniStyles.radioBtnText, selected && miniStyles.radioBtnTextSelected]}>
                        {val === 'yes' ? 'Yes' : 'No'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[miniStyles.analyzeBtn, !complete && miniStyles.analyzeBtnDisabled]}
            onPress={handleCheck}
            disabled={!complete}
          >
            <Text style={miniStyles.analyzeBtnText}>
              {complete ? '⚡ Analyse My Risk Now' : `Answer all questions to continue (${answered}/${miniQuestions.length})`}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
    </SafeAreaView>
  );
}

const miniStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: Colors.navy,
    marginBottom: 2,
  },
  sub: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.subtle,
  },
  resetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  resetBtnText: {
    fontFamily: Fonts.bodyMed,
    fontSize: 12,
    color: Colors.muted,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#e6e9ef',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.cyan,
    borderRadius: 3,
  },
  progressCount: {
    fontFamily: Fonts.heading,
    fontSize: 12,
    color: Colors.cyan,
  },
  questionCard: {
    backgroundColor: Colors.bg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 10,
  },
  questionCardAnswered: {
    borderColor: 'rgba(6,182,212,0.35)',
  },
  qNumber: {
    fontFamily: Fonts.bodySemi,
    fontSize: 10,
    color: Colors.slateLight,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  qText: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: Colors.navy,
    lineHeight: 20,
    marginBottom: 12,
  },
  radioRow: {
    flexDirection: 'row',
    gap: 10,
  },
  radioBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  radioBtnSelected: {
    borderColor: Colors.cyan,
    backgroundColor: 'rgba(6,182,212,0.08)',
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDotSelected: {
    borderColor: Colors.cyan,
    backgroundColor: Colors.cyan,
  },
  radioDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
  },
  radioBtnText: {
    fontFamily: Fonts.bodyMed,
    fontSize: 14,
    color: Colors.slateLight,
  },
  radioBtnTextSelected: {
    color: Colors.navy,
    fontFamily: Fonts.bodySemi,
  },
  analyzeBtn: {
    backgroundColor: Colors.cyan,
    paddingVertical: 15,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  analyzeBtnDisabled: {
    backgroundColor: '#b0d8e0',
    shadowOpacity: 0,
    elevation: 0,
  },
  analyzeBtnText: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    color: Colors.white,
  },
  resultBox: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: 20,
  },
  resultTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  resultIcon: {
    fontSize: 32,
  },
  resultLabel: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    letterSpacing: -0.3,
  },
  resultPercent: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    letterSpacing: -0.5,
  },
  resultAdvice: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.slateLight,
    lineHeight: 20,
  },
  reportBtn: {
    backgroundColor: Colors.red,
    paddingVertical: 12,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  reportBtnText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: Colors.white,
  },
  tryAgainBtn: {
    paddingVertical: 11,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  tryAgainBtnText: {
    fontFamily: Fonts.bodyMed,
    fontSize: 13,
    color: Colors.slateLight,
  },
});

/* ── MAIN HOME SCREEN ─────────────────────────────────────── */
export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Header />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── HERO ── */}
        <View style={styles.hero}>
          <View style={styles.heroEyebrow}>
            <Text style={styles.heroEyebrowText}>🛡️ AI-Powered Scam Detection</Text>
          </View>
          <Text style={styles.heroH1}>
            Protect Yourself From{' '}
            <Text style={styles.heroAccent}>Digital Scams</Text>
          </Text>
          <Text style={styles.heroSub}>
            India's growing scam threats demand fast awareness. Our risk engine helps you detect suspicious activity and stay protected from financial fraud.
          </Text>
          <View style={styles.trustRow}>
            {['No Login', '100% Free', 'Data Safe', 'Works in Hindi'].map(t => (
              <View key={t} style={styles.trustItem}>
                <Text style={styles.trustCheck}>✓</Text>
                <Text style={styles.trustText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── MINI CALCULATOR ── */}
        <View style={styles.miniSection}>
          <MiniCalculator />
        </View>

        {/* Learn More CTA */}
        <View style={{ alignItems: 'center', paddingHorizontal: 16, marginBottom: 32 }}>
          <TouchableOpacity
            style={styles.learnBtn}
            onPress={() => Linking.openURL('https://cybercrime.gov.in')}
          >
            <Text style={styles.learnBtnText}>📖 Learn More at cybercrime.gov.in</Text>
          </TouchableOpacity>
        </View>

        {/* ── STATS ── */}
        <View style={[styles.section, styles.sectionAlt]}>
          <View style={styles.sectionTag}><Text style={styles.sectionTagText}>⚠️ THE THREAT IS REAL</Text></View>
          <Text style={styles.sectionTitle}>Scam Activity in India</Text>
          <Text style={styles.sectionSub}>These numbers represent real people — your family, neighbors, and friends.</Text>
          <View style={styles.statsGrid}>
            {stats.map(s => (
              <View key={s.label} style={styles.statCard}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={styles.statSub}>{s.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── SCAM TYPES ── */}
        <View style={styles.section}>
          <View style={styles.sectionTag}><Text style={styles.sectionTagText}>🔍 KNOW THE THREATS</Text></View>
          <Text style={styles.sectionTitle}>Common Scam Types</Text>
          <Text style={styles.sectionSub}>Understanding how scams work is your first line of defence.</Text>
          <View style={styles.scamGrid}>
            {scamTypes.map(s => (
              <View key={s.title} style={styles.scamCard}>
                <View style={styles.scamCardTop}>
                  <Text style={styles.scamIcon}>{s.icon}</Text>
                  <View style={[styles.riskBadge, { backgroundColor: riskBadgeColor[s.risk] + '22', borderColor: riskBadgeColor[s.risk] + '44' }]}>
                    <Text style={[styles.riskBadgeText, { color: riskBadgeColor[s.risk] }]}>{s.risk}</Text>
                  </View>
                </View>
                <Text style={styles.scamTitle}>{s.title}</Text>
                <Text style={styles.scamDesc}>{s.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── HOW IT WORKS ── */}
        <View style={[styles.section, styles.sectionAlt]}>
          <View style={styles.sectionTag}><Text style={styles.sectionTagText}>🧭 SIMPLE PROCESS</Text></View>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <Text style={styles.sectionSub}>Three easy steps. No tech knowledge required.</Text>
          <View style={styles.stepsGrid}>
            {steps.map(s => (
              <View key={s.num} style={styles.stepCard}>
                <Text style={styles.stepNum}>STEP {s.num}</Text>
                <Text style={styles.stepIconEmoji}>{s.icon}</Text>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.tryFreeBtn} onPress={() => router.push('../calculator')}>
            <Text style={styles.tryFreeBtnText}>⚡ Try It Now — It's Free</Text>
          </TouchableOpacity>
        </View>

        {/* ── PRIVACY ── */}
        <View style={styles.section}>
          <View style={styles.sectionTag}><Text style={styles.sectionTagText}>🔒 YOUR PRIVACY</Text></View>
          <Text style={styles.sectionTitle}>Privacy First, Always</Text>
          <Text style={styles.sectionSub}>Built on a foundation of zero data collection.</Text>
          <View style={styles.privacyGrid}>
            {privacyPoints.map(p => (
              <View key={p.title} style={styles.privacyCard}>
                <View style={styles.privacyIconWrap}><Text style={styles.privacyIcon}>{p.icon}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.privacyTitle}>{p.title}</Text>
                  <Text style={styles.privacyDesc}>{p.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── EMERGENCY BANNER ── */}
        <View style={styles.emergency}>
          <View style={styles.emergencyLeft}>
            <Text style={styles.emergencyPulse}>🚨</Text>
            <View>
              <Text style={styles.emergencyLabel}>National Cyber Crime Helpline</Text>
              <Text style={styles.emergencyNumber}>1930</Text>
              <Text style={styles.emergencyDesc}>Already been scammed? Call immediately — time matters.</Text>
            </View>
          </View>
          <View style={styles.emergencyActions}>
            <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL('tel:1930')}>
              <Text style={styles.callBtnText}>📞 Call 1930 Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportOutlineBtn} onPress={() => router.push('../report')}>
              <Text style={styles.reportOutlineBtnText}>📋 File Online Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0 },

  /* HERO */
  hero: {
    padding: 28,
    paddingTop: 36,
    alignItems: 'flex-start',
  },
  heroEyebrow: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: 'rgba(6,182,212,0.1)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
    marginBottom: 16,
  },
  heroEyebrowText: {
    fontFamily: Fonts.bodySemi,
    fontSize: 11,
    color: Colors.cyan,
    letterSpacing: 0.8,
  },
  heroH1: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.navy,
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 12,
  },
  heroAccent: { color: Colors.cyan },
  heroSub: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.muted,
    lineHeight: 24,
    marginBottom: 20,
  },
  trustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustCheck: { color: Colors.green, fontSize: 13 },
  trustText: {
    fontFamily: Fonts.bodyMed,
    fontSize: 12,
    color: Colors.muted,
  },

  /* MINI SECTION */
  miniSection: { marginVertical: 8 },

  /* LEARN BTN */
  learnBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  learnBtnText: {
    fontFamily: Fonts.bodyMed,
    fontSize: 14,
    color: Colors.slateLight,
  },

  /* SECTIONS */
  section: {
    padding: 24,
    paddingTop: 32,
  },
  sectionAlt: {
    backgroundColor: Colors.bgAlt,
  },
  sectionTag: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(6,182,212,0.08)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.15)',
    marginBottom: 10,
  },
  sectionTagText: {
    fontFamily: Fonts.bodySemi,
    fontSize: 10,
    color: Colors.cyan,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: Colors.navy,
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSub: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },

  /* STATS */
  statsGrid: { gap: 12 },
  statCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    alignItems: 'center',
  },
  statIcon: { fontSize: 28, marginBottom: 10 },
  statValue: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: Fonts.bodySemi,
    fontSize: 14,
    color: Colors.navy,
    marginBottom: 2,
  },
  statSub: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.muted,
  },

  /* SCAM TYPES */
  scamGrid: { gap: 12 },
  scamCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
  },
  scamCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scamIcon: { fontSize: 24 },
  riskBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  riskBadgeText: {
    fontFamily: Fonts.bodySemi,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  scamTitle: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    color: Colors.navy,
    marginBottom: 4,
  },
  scamDesc: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 20,
  },

  /* STEPS */
  stepsGrid: { gap: 14, marginBottom: 24 },
  stepCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    alignItems: 'center',
  },
  stepNum: {
    fontFamily: Fonts.bodySemi,
    fontSize: 10,
    color: Colors.subtle,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  stepIconEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  stepTitle: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    color: Colors.navy,
    marginBottom: 6,
    textAlign: 'center',
  },
  stepDesc: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 20,
    textAlign: 'center',
  },
  tryFreeBtn: {
    backgroundColor: Colors.cyan,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  tryFreeBtnText: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    color: Colors.white,
  },

  /* PRIVACY */
  privacyGrid: { gap: 12 },
  privacyCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    alignItems: 'flex-start',
  },
  privacyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  privacyIcon: { fontSize: 20 },
  privacyTitle: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: Colors.navy,
    marginBottom: 4,
  },
  privacyDesc: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 19,
  },

  /* EMERGENCY */
  emergency: {
    backgroundColor: 'rgba(239,68,68,0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(239,68,68,0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239,68,68,0.15)',
    padding: 24,
    gap: 20,
  },
  emergencyLeft: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  emergencyPulse: { fontSize: 32 },
  emergencyLabel: {
    fontFamily: Fonts.bodySemi,
    fontSize: 11,
    color: Colors.red,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  emergencyNumber: {
    fontFamily: Fonts.heading,
    fontSize: 36,
    color: Colors.red,
    letterSpacing: -1,
    lineHeight: 40,
    marginBottom: 2,
  },
  emergencyDesc: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 19,
  },
  emergencyActions: { gap: 10 },
  callBtn: {
    backgroundColor: Colors.red,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  callBtnText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: Colors.white,
  },
  reportOutlineBtn: {
    paddingVertical: 13,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    alignItems: 'center',
  },
  reportOutlineBtnText: {
    fontFamily: Fonts.bodySemi,
    fontSize: 15,
    color: Colors.red,
  },
});