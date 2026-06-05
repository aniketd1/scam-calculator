import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Colors, Fonts, Radius } from '../constants/theme';

/* ── CONTACT CHANNELS ─────────────────────────────────────── */
const channels = [
  {
    icon: '🚨',
    title: 'Cyber Crime Helpline',
    desc: 'Report active fraud or financial crime in progress.',
    action: 'Call 1930',
    url: 'tel:1930',
    color: Colors.red,
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
  },
  {
    icon: '🌐',
    title: 'Cyber Crime Portal',
    desc: 'File a formal online complaint with the Government of India.',
    action: 'cybercrime.gov.in',
    url: 'https://cybercrime.gov.in',
    color: Colors.cyan,
    bg: 'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.2)',
  },
  {
    icon: '📧',
    title: 'Email Us',
    desc: 'For feedback, suggestions, or non-emergency queries.',
    action: 'support@scam2safe.in',
    url: 'mailto:support@scam2safe.in',
    color: Colors.amber,
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
  },
];

const faqs = [
  {
    q: 'Is Scam2Safe free to use?',
    a: 'Yes — completely free, no login, no subscription.',
  },
  {
    q: 'Do you store my answers or personal data?',
    a: 'No. All session data is cleared when you close the app. Nothing is stored on our servers.',
  },
  {
    q: "I've already been scammed — what do I do?",
    a: 'Call 1930 immediately. Time matters for fund recovery. Then file an online report at cybercrime.gov.in.',
  },
  {
    q: 'How accurate is the risk calculator?',
    a: 'It cross-references your answers against known scam patterns. Use it as a guide — if in doubt, always call your bank or police directly.',
  },
];

/* ── FAQ ITEM ─────────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={styles.faqCard}
      onPress={() => setOpen(o => !o)}
      activeOpacity={0.8}
    >
      <View style={styles.faqRow}>
        <Text style={styles.faqQ}>{q}</Text>
        <Text style={[styles.faqChevron, open && styles.faqChevronOpen]}>▾</Text>
      </View>
      {open && <Text style={styles.faqA}>{a}</Text>}
    </TouchableOpacity>
  );
}

/* ── SCREEN ───────────────────────────────────────────────── */
export default function ContactScreen() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!name.trim() || !message.trim()) {
      Alert.alert('Missing fields', 'Please fill in both your name and message.');
      return;
    }
    const subject = encodeURIComponent(`Scam2Safe feedback from ${name}`);
    const body = encodeURIComponent(message);
    Linking.openURL(`mailto:support@scam2safe.in?subject=${subject}&body=${body}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Header />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.pgTag}>
            <Text style={styles.pgTagText}>📬 CONTACT US</Text>
          </View>
          <Text style={styles.h1}>
            We're Here{'\n'}to <Text style={styles.accent}>Help You</Text>
          </Text>
          <Text style={styles.heroSub}>
            Reached by a scammer? Have feedback? Use the channels below — we'll always point you to the fastest route.
          </Text>
        </View>

        {/* CONTACT CHANNELS */}
        <View style={styles.channelList}>
          {channels.map(c => (
            <TouchableOpacity
              key={c.title}
              style={[styles.channelCard, { backgroundColor: c.bg, borderColor: c.border }]}
              onPress={() => Linking.openURL(c.url)}
              activeOpacity={0.8}
            >
              <View style={styles.channelLeft}>
                <Text style={styles.channelIcon}>{c.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.channelTitle}>{c.title}</Text>
                  <Text style={styles.channelDesc}>{c.desc}</Text>
                </View>
              </View>
              <View style={[styles.channelActionPill, { borderColor: c.color + '50' }]}>
                <Text style={[styles.channelActionText, { color: c.color }]}>{c.action} →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* QUICK MESSAGE FORM */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Send a Message</Text>
          <Text style={styles.sectionSub}>
            Opens your email app pre-filled and ready to send.
          </Text>
          <View style={styles.formCard}>
            <Text style={styles.fieldLabel}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Priya Sharma"
              placeholderTextColor={Colors.subtle}
              value={name}
              onChangeText={setName}
            />
            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Message</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Describe your feedback or question..."
              placeholderTextColor={Colors.subtle}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Text style={styles.sendBtnText}>📧 Open in Email App</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ */}
        <View style={[styles.section, { backgroundColor: Colors.bgAlt }]}>
          <Text style={styles.sectionTitle}>❓ Frequently Asked</Text>
          <Text style={styles.sectionSub}>Quick answers to common questions.</Text>
          <View style={styles.faqList}>
            {faqs.map(f => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </View>
        </View>

        {/* EMERGENCY STRIP */}
        <View style={styles.emergency}>
          <Text style={styles.emergencyPulse}>🚨</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.emergencyLabel}>IN AN EMERGENCY</Text>
            <Text style={styles.emergencyNumber}>1930</Text>
            <Text style={styles.emergencyDesc}>National Cyber Crime Helpline — 24/7</Text>
          </View>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => Linking.openURL('tel:1930')}
          >
            <Text style={styles.callBtnText}>Call Now</Text>
          </TouchableOpacity>
        </View>

        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── STYLES ───────────────────────────────────────────────── */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0 },

  /* HERO */
  hero: { padding: 24, paddingTop: 32 },
  pgTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(6,182,212,0.1)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
    marginBottom: 14,
  },
  pgTagText: {
    fontFamily: Fonts.bodySemi,
    fontSize: 10,
    color: Colors.cyan,
    letterSpacing: 1,
  },
  h1: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.navy,
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 10,
  },
  accent: { color: Colors.cyan },
  heroSub: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 22,
  },

  /* CHANNELS */
  channelList: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  channelCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  channelLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  channelIcon: { fontSize: 26, flexShrink: 0 },
  channelTitle: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    color: Colors.navy,
    marginBottom: 3,
  },
  channelDesc: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 19,
  },
  channelActionPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  channelActionText: {
    fontFamily: Fonts.bodySemi,
    fontSize: 12,
  },

  /* SECTION */
  section: { padding: 24, paddingTop: 28 },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: Colors.navy,
    marginBottom: 4,
  },
  sectionSub: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 20,
    marginBottom: 18,
  },

  /* FORM */
  formCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
  },
  fieldLabel: {
    fontFamily: Fonts.bodySemi,
    fontSize: 12,
    color: Colors.navy,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: Colors.bg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.navy,
  },
  inputMulti: {
    minHeight: 110,
    paddingTop: 12,
  },
  sendBtn: {
    marginTop: 16,
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
  sendBtnText: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    color: Colors.white,
  },

  /* FAQ */
  faqList: { gap: 10 },
  faqCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  faqQ: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: Colors.navy,
    flex: 1,
    lineHeight: 20,
  },
  faqChevron: {
    fontSize: 16,
    color: Colors.slateLight,
    flexShrink: 0,
  },
  faqChevronOpen: {
    color: Colors.cyan,
    transform: [{ rotate: '180deg' }],
  },
  faqA: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 20,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  /* EMERGENCY */
  emergency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    margin: 16,
    marginBottom: 24,
    backgroundColor: 'rgba(239,68,68,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    borderRadius: Radius.lg,
    padding: 18,
  },
  emergencyPulse: { fontSize: 28, flexShrink: 0 },
  emergencyLabel: {
    fontFamily: Fonts.bodySemi,
    fontSize: 9,
    color: Colors.red,
    letterSpacing: 1,
    marginBottom: 2,
  },
  emergencyNumber: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.red,
    letterSpacing: -1,
    lineHeight: 32,
  },
  emergencyDesc: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.muted,
    lineHeight: 16,
  },
  callBtn: {
    backgroundColor: Colors.red,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.md,
    flexShrink: 0,
  },
  callBtnText: {
    fontFamily: Fonts.bodySemi,
    fontSize: 13,
    color: Colors.white,
  },
});