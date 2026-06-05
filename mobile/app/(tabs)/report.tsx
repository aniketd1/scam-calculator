import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Colors, Fonts, Radius } from '../../constants/theme';

/* ── DATA ─────────────────────────────────────────────────── */
const scamTypeOptions = [
  { icon: '🔢', label: 'OTP / PIN Scam' },
  { icon: '📋', label: 'KYC Update Scam' },
  { icon: '💳', label: 'UPI / QR Code Fraud' },
  { icon: '👮', label: 'Digital Arrest' },
  { icon: '📦', label: 'Courier / Parcel Scam' },
  { icon: '🏦', label: 'Fake Banking Call' },
  { icon: '💰', label: 'Lottery / Prize Scam' },
  { icon: '👥', label: 'Impersonation Scam' },
  { icon: '🛒', label: 'Online Shopping Fraud' },
  { icon: '❓', label: 'Other / Not Sure' },
];

const channelOptions = [
  { icon: '📞', label: 'Phone Call' },
  { icon: '💬', label: 'WhatsApp Message' },
  { icon: '📱', label: 'SMS / Text' },
  { icon: '📧', label: 'Email' },
  { icon: '🌐', label: 'Social Media (Facebook, Instagram)' },
  { icon: '🔗', label: 'Suspicious Website / Link' },
  { icon: '📹', label: 'Video Call' },
];

const STEPS = ['Scam Type', 'Channel', 'Details', 'Your Info', 'Review'];

interface FormData {
  scamType: string;
  channel: string;
  incidentDate: string;
  description: string;
  financialLoss: string;
  lossAmount: string;
  suspectPhone: string;
  suspectName: string;
  evidence: string;
  reporterName: string;
  reporterPhone: string;
  reporterEmail: string;
  anonymous: boolean;
}

const INITIAL_FORM: FormData = {
  scamType: '',
  channel: '',
  incidentDate: '',
  description: '',
  financialLoss: 'no',
  lossAmount: '',
  suspectPhone: '',
  suspectName: '',
  evidence: '',
  reporterName: '',
  reporterPhone: '',
  reporterEmail: '',
  anonymous: false,
};

/* ── STEP INDICATOR ──────────────────────────────────────── */
function StepIndicator({ current, labels }: { current: number; labels: string[] }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={stepStyles.container}
    >
      {labels.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <View key={label} style={stepStyles.item}>
            <View style={[stepStyles.circle, done && stepStyles.circleDone, active && stepStyles.circleActive]}>
              <Text style={[stepStyles.circleText, (done || active) && stepStyles.circleTextActive]}>
                {done ? '✓' : i + 1}
              </Text>
            </View>
            <Text style={[stepStyles.label, done && stepStyles.labelDone, active && stepStyles.labelActive]}>
              {label}
            </Text>
            {i < labels.length - 1 && (
              <View style={[stepStyles.connector, done && stepStyles.connectorDone]} />
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const stepStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 0,
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 0,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    borderColor: Colors.cyan,
    backgroundColor: 'rgba(6,182,212,0.12)',
  },
  circleDone: {
    borderColor: Colors.green,
    backgroundColor: 'rgba(34,197,94,0.12)',
  },
  circleText: {
    fontFamily: Fonts.bodySemi,
    fontSize: 12,
    color: Colors.muted,
  },
  circleTextActive: { color: Colors.cyan },
  label: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.muted,
    marginLeft: 4,
    marginRight: 4,
  },
  labelActive: { color: Colors.cyan, fontFamily: Fonts.bodySemi },
  labelDone: { color: Colors.green },
  connector: {
    width: 20,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 2,
  },
  connectorDone: { backgroundColor: Colors.green },
});

/* ── MAIN SCREEN ─────────────────────────────────────────── */
export default function ReportScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refNumber] = useState(() => 'SRC' + Date.now().toString().slice(-8));

  const set = (key: keyof FormData, val: any) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const canNext = (): boolean => {
    if (step === 0) return !!form.scamType;
    if (step === 1) return !!form.channel;
    if (step === 2) return form.description.length >= 20;
    if (step === 3) return form.anonymous || !!(form.reporterName && form.reporterPhone);
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('https://n8n.srv1711105.hstgr.cloud/webhook/scam-checking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: form.description,
          fullReport: form,
        }),
      });
      await response.json();
      setSubmitted(true);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── SUCCESS ── */
  if (submitted) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <Header />
        <ScrollView contentContainerStyle={styles.successPage}>
          <View style={styles.successBox}>
            <View style={styles.successIconWrap}>
              <Text style={styles.successIconText}>✅</Text>
            </View>
            <View style={styles.successRefBadge}>
              <Text style={styles.successRefText}>Reference #{refNumber}</Text>
            </View>
            <Text style={styles.successTitle}>Report Submitted Successfully</Text>
            <Text style={styles.successMsg}>
              Your scam report has been recorded. Please save your reference number above for follow-up. For immediate assistance, call the Cyber Crime Helpline.
            </Text>

            <Text style={styles.nextTitle}>What happens next?</Text>
            {[
              { icon: '📋', text: 'Your report details are documented and timestamped.' },
              { icon: '🔍', text: 'You can quote your reference number when filing on cybercrime.gov.in.' },
              { icon: '📞', text: 'If you shared contact details, our team may reach out if more info is needed.' },
            ].map(s => (
              <View key={s.text} style={styles.nextStep}>
                <Text style={styles.nextStepIcon}>{s.icon}</Text>
                <Text style={styles.nextStepText}>{s.text}</Text>
              </View>
            ))}

            <View style={styles.successHelpline}>
              <Text style={styles.shLabel}>For immediate action, call</Text>
              <Text style={styles.shNumber}>1930</Text>
              <Text style={styles.shSub}>National Cyber Crime Helpline · 24/7</Text>
            </View>

            <View style={styles.successActions}>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => Linking.openURL('https://cybercrime.gov.in')}
              >
                <Text style={styles.btnPrimaryText}>🌐 File Official FIR on cybercrime.gov.in</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnOutline} onPress={() => router.push('../calculator')}>
                <Text style={styles.btnOutlineText}>⚡ Check Another Risk</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnOutline} onPress={() => router.push('/')}>
                <Text style={styles.btnOutlineText}>← Back to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Footer />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 0 }}>

        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.heroTag}>
            <Text style={styles.heroTagText}>📋 REPORT A SCAM</Text>
          </View>
          <Text style={styles.heroH1}>
            Help Us <Text style={styles.accent}>Fight Back</Text> Against Scammers
          </Text>
          <Text style={styles.heroSub}>
            Document your scam encounter in under 3 minutes. All reports are completely anonymous if you choose.
          </Text>
        </View>

        {/* EMERGENCY STRIP */}
        <View style={styles.emergencyStrip}>
          <Text style={styles.esPulse}>🚨</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.esLabel}>Just been scammed? Don't wait — call immediately</Text>
            <Text style={styles.esNumber}>1930</Text>
          </View>
          <TouchableOpacity style={styles.esBtn} onPress={() => Linking.openURL('tel:1930')}>
            <Text style={styles.esBtnText}>Call Now</Text>
          </TouchableOpacity>
        </View>

        {/* STEP INDICATOR */}
        <StepIndicator current={step} labels={STEPS} />

        {/* FORM CARD */}
        <View style={styles.formCard}>

          {/* ── STEP 0: SCAM TYPE ── */}
          {step === 0 && (
            <View>
              <Text style={styles.stepHeading}>What type of scam did you encounter?</Text>
              <Text style={styles.stepSub}>Select the option that best describes what happened.</Text>
              <View style={styles.typeGrid}>
                {scamTypeOptions.map(opt => (
                  <TouchableOpacity
                    key={opt.label}
                    style={[styles.typeBtn, form.scamType === opt.label && styles.typeBtnSelected]}
                    onPress={() => set('scamType', opt.label)}
                  >
                    <Text style={styles.typeIcon}>{opt.icon}</Text>
                    <Text style={[styles.typeLabel, form.scamType === opt.label && styles.typeLabelSelected]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ── STEP 1: CHANNEL ── */}
          {step === 1 && (
            <View>
              <Text style={styles.stepHeading}>How did the scammer contact you?</Text>
              <Text style={styles.stepSub}>Select the primary communication channel used.</Text>
              <View style={{ gap: 10 }}>
                {channelOptions.map(opt => (
                  <TouchableOpacity
                    key={opt.label}
                    style={[styles.channelBtn, form.channel === opt.label && styles.channelBtnSelected]}
                    onPress={() => set('channel', opt.label)}
                  >
                    <Text style={styles.chIcon}>{opt.icon}</Text>
                    <Text style={[styles.chLabel, form.channel === opt.label && styles.chLabelSelected]}>
                      {opt.label}
                    </Text>
                    {form.channel === opt.label && (
                      <Text style={styles.chCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ── STEP 2: INCIDENT DETAILS ── */}
          {step === 2 && (
            <View>
              <Text style={styles.stepHeading}>Tell us what happened</Text>
              <Text style={styles.stepSub}>The more detail you provide, the more useful your report will be.</Text>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>When did this happen?</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.subtle}
                  value={form.incidentDate}
                  onChangeText={v => set('incidentDate', v)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Describe the incident *</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextarea]}
                  placeholder="Describe exactly what happened — what was said, what was asked, what links or numbers were involved..."
                  placeholderTextColor={Colors.subtle}
                  value={form.description}
                  onChangeText={v => set('description', v)}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
                <Text style={[styles.charCount, form.description.length < 20 && styles.charCountWarn]}>
                  {form.description.length} characters {form.description.length < 20 ? '(minimum 20)' : '✓'}
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Did you suffer a financial loss?</Text>
                <View style={styles.radioGroupH}>
                  {[
                    { v: 'yes', l: 'Yes, I lost money' },
                    { v: 'no', l: 'No financial loss' },
                    { v: 'attempted', l: 'They tried but failed' },
                  ].map(({ v, l }) => (
                    <TouchableOpacity
                      key={v}
                      style={[styles.radioChip, form.financialLoss === v && styles.radioChipSelected]}
                      onPress={() => set('financialLoss', v)}
                    >
                      <Text style={[styles.radioChipText, form.financialLoss === v && styles.radioChipTextSelected]}>
                        {l}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {form.financialLoss === 'yes' && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Approximate amount lost (₹)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. 5000"
                    placeholderTextColor={Colors.subtle}
                    value={form.lossAmount}
                    onChangeText={v => set('lossAmount', v)}
                    keyboardType="numeric"
                  />
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Suspect phone / account number (if known)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="+91 XXXXXXXXXX"
                  placeholderTextColor={Colors.subtle}
                  value={form.suspectPhone}
                  onChangeText={v => set('suspectPhone', v)}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Suspect name or organisation (if known)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 'SBI Customer Care'"
                  placeholderTextColor={Colors.subtle}
                  value={form.suspectName}
                  onChangeText={v => set('suspectName', v)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Any links, screenshots, or additional evidence?</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextarea]}
                  placeholder="Paste any suspicious URLs, message content, or describe evidence you've saved..."
                  placeholderTextColor={Colors.subtle}
                  value={form.evidence}
                  onChangeText={v => set('evidence', v)}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          )}

          {/* ── STEP 3: YOUR INFO ── */}
          {step === 3 && (
            <View>
              <Text style={styles.stepHeading}>Your contact information</Text>
              <Text style={styles.stepSub}>Optional — only needed if you want a follow-up. You can remain fully anonymous.</Text>

              <TouchableOpacity
                style={styles.anonToggle}
                onPress={() => set('anonymous', !form.anonymous)}
              >
                <View style={[styles.toggleTrack, form.anonymous && styles.toggleTrackOn]}>
                  <View style={[styles.toggleThumb, form.anonymous && styles.toggleThumbOn]} />
                </View>
                <View>
                  <Text style={styles.toggleLabel}>Submit anonymously</Text>
                  <Text style={styles.toggleSub}>No contact details will be collected</Text>
                </View>
              </TouchableOpacity>

              {!form.anonymous && (
                <View style={styles.reporterFields}>
                  <View style={styles.infoNote}>
                    <Text style={styles.infoNoteText}>ℹ️ Your details are used only if we need to follow up on your report. Never shared publicly.</Text>
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Your Name *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="e.g. Ramesh Gupta"
                      placeholderTextColor={Colors.subtle}
                      value={form.reporterName}
                      onChangeText={v => set('reporterName', v)}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Phone Number *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="+91 XXXXXXXXXX"
                      placeholderTextColor={Colors.subtle}
                      value={form.reporterPhone}
                      onChangeText={v => set('reporterPhone', v)}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Email Address (optional)</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="you@example.com"
                      placeholderTextColor={Colors.subtle}
                      value={form.reporterEmail}
                      onChangeText={v => set('reporterEmail', v)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              )}
            </View>
          )}

          {/* ── STEP 4: REVIEW ── */}
          {step === 4 && (
            <View>
              <Text style={styles.stepHeading}>Review & Submit</Text>
              <Text style={styles.stepSub}>Please verify your report details before submitting.</Text>

              <View style={styles.reviewGrid}>
                {[
                  { label: 'Scam Type', value: form.scamType },
                  { label: 'Contact Channel', value: form.channel },
                  { label: 'Incident Date', value: form.incidentDate || 'Not specified' },
                  {
                    label: 'Financial Loss',
                    value: form.financialLoss === 'yes'
                      ? `Yes — ₹${form.lossAmount || 'not specified'}`
                      : form.financialLoss === 'attempted'
                        ? 'Attempted but failed'
                        : 'No',
                  },
                  {
                    label: 'Suspect Info',
                    value: [form.suspectPhone, form.suspectName].filter(Boolean).join(' · ') || 'Not provided',
                  },
                  { label: 'Reporter', value: form.anonymous ? 'Anonymous' : form.reporterName || 'Not provided' },
                ].map(r => (
                  <View key={r.label} style={styles.reviewItem}>
                    <Text style={styles.reviewLabel}>{r.label.toUpperCase()}</Text>
                    <Text style={styles.reviewValue}>{r.value}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.reviewDescBox}>
                <Text style={styles.reviewDescLabel}>INCIDENT DESCRIPTION</Text>
                <Text style={styles.reviewDescText}>{form.description}</Text>
              </View>

              <View style={styles.disclaimerBox}>
                <Text style={styles.disclaimerText}>
                  ⚖️ By submitting, you confirm that the information provided is accurate to the best of your knowledge.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.submitFinalBtn, submitting && styles.submitFinalBtnDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Text style={styles.submitFinalBtnText}>
                  {submitting ? '⏳ Submitting...' : '📋 Submit Scam Report'}
                </Text>
              </TouchableOpacity>

              <View style={styles.govNote}>
                <Text style={styles.govNoteText}>
                  💡 For a legally actionable FIR, also file on{' '}
                  <Text style={{ color: Colors.cyan }} onPress={() => Linking.openURL('https://cybercrime.gov.in')}>
                    cybercrime.gov.in
                  </Text>
                </Text>
              </View>
            </View>
          )}

          {/* NAV BUTTONS */}
          <View style={styles.formNav}>
            {step > 0 && (
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(s => s - 1)}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
            )}
            {step < STEPS.length - 1 && (
              <TouchableOpacity
                style={[styles.nextBtn, !canNext() && styles.nextBtnDisabled, step === 0 && { marginLeft: 'auto' as any }]}
                disabled={!canNext()}
                onPress={() => setStep(s => s + 1)}
              >
                <Text style={styles.nextBtnText}>Continue →</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  hero: {
    padding: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  heroTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.22)',
    marginBottom: 14,
  },
  heroTagText: {
    fontFamily: Fonts.bodySemi,
    fontSize: 10,
    color: Colors.red,
    letterSpacing: 1,
  },
  heroH1: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: Colors.navy,
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 10,
  },
  accent: { color: Colors.cyan },
  heroSub: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },

  emergencyStrip: {
    backgroundColor: 'rgba(239,68,68,0.07)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(239,68,68,0.18)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239,68,68,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  esPulse: { fontSize: 22 },
  esLabel: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.muted,
  },
  esNumber: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: Colors.red,
    letterSpacing: -0.5,
  },
  esBtn: {
    backgroundColor: Colors.red,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  esBtnText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    color: Colors.white,
  },

  formCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  stepHeading: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: Colors.navy,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  stepSub: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.muted,
    marginBottom: 20,
    lineHeight: 20,
  },

  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeBtn: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: Colors.bg,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 6,
  },
  typeBtnSelected: {
    borderColor: Colors.cyan,
    backgroundColor: 'rgba(6,182,212,0.08)',
  },
  typeIcon: { fontSize: 24 },
  typeLabel: {
    fontFamily: Fonts.bodyMed,
    fontSize: 11,
    color: Colors.slateLight,
    textAlign: 'center',
    lineHeight: 15,
  },
  typeLabelSelected: { color: Colors.navy },

  channelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.bg,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  channelBtnSelected: {
    borderColor: Colors.cyan,
    backgroundColor: 'rgba(6,182,212,0.07)',
  },
  chIcon: { fontSize: 20, width: 26, textAlign: 'center' },
  chLabel: {
    fontFamily: Fonts.bodyMed,
    fontSize: 14,
    color: Colors.slateLight,
    flex: 1,
  },
  chLabelSelected: { color: Colors.navy },
  chCheck: {
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    color: Colors.cyan,
  },

  formGroup: { marginBottom: 16 },
  formLabel: {
    fontFamily: Fonts.bodySemi,
    fontSize: 13,
    color: Colors.muted,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 11,
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.navy,
  },
  formTextarea: {
    minHeight: 100,
    paddingTop: 12,
  },
  charCount: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.muted,
    textAlign: 'right',
    marginTop: 4,
  },
  charCountWarn: { color: Colors.amber },

  radioGroupH: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  radioChipSelected: {
    borderColor: Colors.cyan,
    backgroundColor: 'rgba(6,182,212,0.1)',
  },
  radioChipText: {
    fontFamily: Fonts.bodyMed,
    fontSize: 13,
    color: Colors.muted,
  },
  radioChipTextSelected: { color: Colors.navy },

  anonToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    backgroundColor: Colors.bg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 18,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleTrackOn: { backgroundColor: Colors.cyan },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.white,
    alignSelf: 'flex-start',
  },
  toggleThumbOn: { alignSelf: 'flex-end' },
  toggleLabel: {
    fontFamily: Fonts.bodySemi,
    fontSize: 14,
    color: Colors.navy,
  },
  toggleSub: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.muted,
    marginTop: 1,
  },

  reporterFields: { gap: 0 },
  infoNote: {
    padding: 12,
    backgroundColor: 'rgba(6,182,212,0.06)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.18)',
    marginBottom: 16,
  },
  infoNoteText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.muted,
    lineHeight: 18,
  },

  reviewGrid: { gap: 10, marginBottom: 14 },
  reviewItem: {
    backgroundColor: Colors.bg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  reviewLabel: {
    fontFamily: Fonts.bodySemi,
    fontSize: 10,
    color: Colors.muted,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  reviewValue: {
    fontFamily: Fonts.bodyMed,
    fontSize: 14,
    color: Colors.navy,
  },
  reviewDescBox: {
    backgroundColor: Colors.bg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 14,
  },
  reviewDescLabel: {
    fontFamily: Fonts.bodySemi,
    fontSize: 10,
    color: Colors.muted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  reviewDescText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.slateLight,
    lineHeight: 20,
  },
  disclaimerBox: {
    backgroundColor: 'rgba(245,158,11,0.07)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.22)',
    padding: 14,
    marginBottom: 16,
  },
  disclaimerText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#92400e',
    lineHeight: 18,
  },
  submitFinalBtn: {
    backgroundColor: Colors.cyan,
    paddingVertical: 15,
    borderRadius: Radius.md,
    alignItems: 'center',
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  submitFinalBtnDisabled: {
    backgroundColor: '#b0d8e0',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitFinalBtnText: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    color: Colors.white,
  },
  govNote: {
    padding: 12,
    backgroundColor: 'rgba(6,182,212,0.06)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.15)',
  },
  govNoteText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.muted,
    lineHeight: 18,
  },

  formNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  backBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  backBtnText: {
    fontFamily: Fonts.bodyMed,
    fontSize: 14,
    color: Colors.muted,
  },
  nextBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.md,
    backgroundColor: Colors.cyan,
    alignItems: 'center',
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  nextBtnDisabled: {
    backgroundColor: '#b0d8e0',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextBtnText: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: Colors.white,
  },

  /* SUCCESS */
  successPage: { paddingBottom: 0 },
  successBox: {
    margin: 20,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.28)',
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  successIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(34,197,94,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successIconText: { fontSize: 28 },
  successRefBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: 'rgba(6,182,212,0.1)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.22)',
    marginBottom: 12,
  },
  successRefText: {
    fontFamily: Fonts.bodySemi,
    fontSize: 12,
    color: Colors.cyan,
  },
  successTitle: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: Colors.green,
    letterSpacing: -0.3,
    marginBottom: 10,
    textAlign: 'center',
  },
  successMsg: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  nextTitle: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: Colors.navy,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  nextStep: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    backgroundColor: Colors.bg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  nextStepIcon: { fontSize: 16 },
  nextStepText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 20,
    flex: 1,
  },
  successHelpline: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.22)',
    borderRadius: Radius.md,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginVertical: 16,
  },
  shLabel: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.muted,
    marginBottom: 2,
  },
  shNumber: {
    fontFamily: Fonts.heading,
    fontSize: 32,
    color: Colors.red,
    letterSpacing: -1,
  },
  shSub: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.muted,
  },
  successActions: { width: '100%', gap: 10 },
  btnPrimary: {
    backgroundColor: Colors.cyan,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  btnPrimaryText: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: Colors.white,
    paddingLeft: 50,
  },
  btnOutline: {
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  btnOutlineText: {
    fontFamily: Fonts.bodyMed,
    fontSize: 14,
    color: Colors.slateLight,
  },
});