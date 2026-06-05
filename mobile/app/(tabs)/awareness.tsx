import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Colors, Fonts, Radius } from '../../constants/theme';

/* ── DATA ─────────────────────────────────────────────────── */
const categories = [
  'All',
  'Calls & OTP',
  'Banking',
  'Social Media',
  'Courier & Delivery',
  'Government Impersonation',
];

const scams = [
  {
    id: 1, category: 'Calls & OTP', risk: 'HIGH', icon: '🔢',
    title: 'OTP Scam',
    summary: "A caller claims your bank account is compromised and asks you to share the OTP sent to your phone to 'secure' it.",
    howItWorks: "Fraudsters already have partial access to your account or have collected your basic details. They call posing as bank officials and trick you into sharing the OTP that would actually authorise a transaction they're making.",
    redFlags: ['Caller urgently asks for OTP', 'Claims your account will be blocked', "Asks you to 'confirm' identity via OTP", "Threatens legal action if you don't comply"],
    whatToDo: 'Hang up immediately. Banks NEVER ask for OTPs over the phone. Call your bank\'s official number to verify.',
  },
  {
    id: 2, category: 'Banking', risk: 'HIGH', icon: '📋',
    title: 'KYC Update Scam',
    summary: 'You receive an SMS/WhatsApp message saying your KYC is incomplete and your account will be suspended unless you click a link.',
    howItWorks: 'The link leads to a fake bank website that looks identical to the real one. Entering your credentials gives scammers full access to your account.',
    redFlags: ['SMS with a link asking for KYC', 'Urgency around account suspension', 'Link goes to a non-official domain', 'Asks for full account number + password'],
    whatToDo: "Never click links in SMS. Visit your bank's official website directly by typing the address yourself.",
  },
  {
    id: 3, category: 'Banking', risk: 'HIGH', icon: '💳',
    title: 'UPI / QR Code Fraud',
    summary: "Someone sends you a QR code or payment request saying they're 'sending' you money — but scanning it actually deducts money from your account.",
    howItWorks: "Payment requests in UPI always deduct from the scanner. Fraudsters exploit the confusion between 'sending' and 'receiving' UPI requests.",
    redFlags: ["Buyer sends QR code to 'pay you'", "Request says 'collect payment'", 'WhatsApp seller asking to scan code', 'Unknown UPI collect requests'],
    whatToDo: 'Remember: Receiving money NEVER requires you to enter a PIN or scan a QR code. Reject all unknown UPI collect requests.',
  },
  {
    id: 4, category: 'Government Impersonation', risk: 'CRITICAL', icon: '👮',
    title: 'Digital Arrest Scam',
    summary: "A video call from someone impersonating a police officer, CBI, or customs official claims you're under 'digital arrest' for a crime.",
    howItWorks: 'Callers use professional-looking uniforms and fake government offices as backgrounds. They threaten arrest or legal action to extort large sums of money.',
    redFlags: ["Video call from 'police' or 'CBI'", 'Claims your Aadhaar is linked to crimes', "Demands money to 'settle' the case", 'Tells you not to inform family'],
    whatToDo: 'Digital arrest does not exist in Indian law. Hang up and call the real police on 100. Report on cybercrime.gov.in.',
  },
  {
    id: 5, category: 'Courier & Delivery', risk: 'MEDIUM', icon: '📦',
    title: 'Courier Scam',
    summary: "A call claims a parcel in your name contains drugs or illegal items, and you must pay a 'fine' to avoid arrest.",
    howItWorks: 'Scammers create panic using fake customs or courier company identities. Fear of legal action makes victims pay without verifying.',
    redFlags: ["Unexpected call about a parcel you didn't send", 'Claims parcel contains illegal items', "Asks for 'clearance fee' to release it", 'Pressures for immediate payment'],
    whatToDo: "Legitimate authorities never demand payment over phone. Contact the courier company directly using their official number.",
  },
  {
    id: 6, category: 'Calls & OTP', risk: 'HIGH', icon: '🏦',
    title: 'Fake Bank Call',
    summary: "Caller poses as your bank's customer service, offers rewards or loan upgrades, and asks to verify your account details.",
    howItWorks: 'Using your name and partial account details bought on the dark web, they gain trust and extract sensitive banking credentials.',
    redFlags: ['Unsolicited call offering rewards or upgrades', 'Asks for full card number or CVV', 'Requests debit/credit card PIN', "Urgency to 'confirm' before offer expires"],
    whatToDo: "Hang up and call your bank's official number from the back of your card. Never share card details on inbound calls.",
  },
  {
    id: 7, category: 'Social Media', risk: 'MEDIUM', icon: '💰',
    title: 'Lottery / Prize Scam',
    summary: "A Facebook or WhatsApp message claims you've won a prize and asks for a 'processing fee' to release your winnings.",
    howItWorks: "There is no prize. Every 'processing fee' just leads to demands for more fees until the victim realises the scam.",
    redFlags: ['Congratulations message from unknown number', 'Prize for a contest you never entered', "Asks for fee to 'release' winnings", 'Winning certificate looks official'],
    whatToDo: 'Ignore and block. Legitimate lotteries never require winners to pay fees upfront to receive their prize.',
  },
  {
    id: 8, category: 'Social Media', risk: 'HIGH', icon: '👥',
    title: 'Impersonation / Friend-in-Need Scam',
    summary: "A message from a friend's hacked account claims they're in trouble and urgently needs money transferred.",
    howItWorks: 'Scammers hack or clone social media accounts and leverage the emotional trust you have in your friends.',
    redFlags: ['Friend asks for money via chat only', 'Refuses to video call to confirm', 'Story keeps changing', 'Asks for payment via UPI or crypto'],
    whatToDo: "Always call your friend's real phone number before sending any money. Verify through a second channel.",
  },
];

const riskColor: Record<string, string> = {
  HIGH: Colors.red,
  CRITICAL: Colors.redDark,
  MEDIUM: Colors.amber,
  LOW: Colors.green,
};

/* ── EXPANDABLE CARD ──────────────────────────────────────── */
function ScamCard({ scam }: { scam: typeof scams[0] }) {
  const [open, setOpen] = useState(false);
  const rc = riskColor[scam.risk];

  return (
    <View style={styles.card}>
      {/* Header row — tap to expand */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => setOpen(o => !o)}
        activeOpacity={0.75}
      >
        <View style={styles.cardIconWrap}>
          <Text style={styles.cardIcon}>{scam.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardTitle}>{scam.title}</Text>
            <View style={[styles.riskPill, { backgroundColor: rc + '20', borderColor: rc + '40' }]}>
              <Text style={[styles.riskPillText, { color: rc }]}>{scam.risk}</Text>
            </View>
          </View>
          <View style={[styles.catPill]}>
            <Text style={styles.catPillText}>{scam.category}</Text>
          </View>
          <Text style={styles.cardSummary}>{scam.summary}</Text>
        </View>
        <Text style={[styles.chevron, open && styles.chevronOpen]}>▾</Text>
      </TouchableOpacity>

      {/* Expanded body */}
      {open && (
        <View style={styles.cardBody}>
          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>HOW IT WORKS</Text>
          <Text style={styles.bodyText}>{scam.howItWorks}</Text>

          <Text style={styles.sectionLabel}>RED FLAGS TO WATCH</Text>
          {scam.redFlags.map(f => (
            <View key={f} style={styles.flagRow}>
              <Text style={styles.flagEmoji}>🚩</Text>
              <Text style={styles.flagText}>{f}</Text>
            </View>
          ))}

          <Text style={styles.sectionLabel}>WHAT TO DO</Text>
          <View style={styles.todoBox}>
            <Text style={styles.todoEmoji}>✅</Text>
            <Text style={styles.todoText}>{scam.whatToDo}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

/* ── SCREEN ───────────────────────────────────────────────── */
export default function AwarenessScreen() {
  const router = useRouter();
  const [active, setActive] = useState('All');

  const filtered = active === 'All' ? scams : scams.filter(s => s.category === active);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Header />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.pgTag}>
            <Text style={styles.pgTagText}>📚 AWARENESS HUB</Text>
          </View>
          <Text style={styles.h1}>
            Know the{' '}
            <Text style={styles.accent}>Scam Tactics</Text>
            {'\n'}Before They Target You
          </Text>
          <Text style={styles.heroSub}>
            Explore common scam patterns, red flags to watch for, and what to do if you encounter suspicious activity.
          </Text>
        </View>

        {/* FILTER CHIPS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBar}
        >
          {categories.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.filterBtn, active === c && styles.filterBtnActive]}
              onPress={() => setActive(c)}
            >
              <Text style={[styles.filterBtnText, active === c && styles.filterBtnTextActive]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SCAM CARDS */}
        <View style={styles.cardList}>
          {filtered.map(scam => (
            <ScamCard key={scam.id} scam={scam} />
          ))}
        </View>

        {/* CTA BANNER */}
        <View style={styles.ctaBanner}>
          <Text style={styles.ctaTitle}>🧠 Think You've Spotted a Scam?</Text>
          <Text style={styles.ctaSub}>
            Use our Risk Calculator to evaluate suspicious calls or messages instantly and for free.
          </Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.push('../calculator')}
          >
            <Text style={styles.ctaBtnText}>⚡ Check Your Scam Risk</Text>
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
  hero: {
    padding: 24,
    paddingTop: 32,
    alignItems: 'flex-start',
  },
  pgTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    marginBottom: 14,
  },
  pgTagText: {
    fontFamily: Fonts.bodySemi,
    fontSize: 10,
    color: Colors.amber,
    letterSpacing: 1,
  },
  h1: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: Colors.navy,
    letterSpacing: -0.5,
    lineHeight: 34,
    marginBottom: 10,
  },
  accent: { color: Colors.cyan },
  heroSub: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 22,
  },

  /* FILTER */
  filterBar: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 8,
    flexDirection: 'row',
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  filterBtnActive: {
    backgroundColor: Colors.cyan,
    borderColor: Colors.cyan,
  },
  filterBtnText: {
    fontFamily: Fonts.bodyMed,
    fontSize: 13,
    color: Colors.slateLight,
  },
  filterBtnTextActive: {
    color: Colors.white,
    fontFamily: Fonts.bodySemi,
  },

  /* CARDS */
  cardList: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 28,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 18,
  },
  cardIconWrap: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardIcon: { fontSize: 22 },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    color: Colors.navy,
    flexShrink: 1,
  },
  riskPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  riskPillText: {
    fontFamily: Fonts.bodySemi,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  catPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(6,182,212,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
    marginBottom: 6,
  },
  catPillText: {
    fontFamily: Fonts.bodyMed,
    fontSize: 10,
    color: Colors.cyan,
  },
  cardSummary: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 19,
  },
  chevron: {
    fontSize: 16,
    color: Colors.slateLight,
    marginTop: 2,
    flexShrink: 0,
  },
  chevronOpen: {
    color: Colors.cyan,
    transform: [{ rotate: '180deg' }],
  },

  /* EXPANDED BODY */
  cardBody: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 14,
  },
  sectionLabel: {
    fontFamily: Fonts.bodySemi,
    fontSize: 10,
    color: Colors.slateLight,
    letterSpacing: 0.9,
    marginBottom: 6,
    marginTop: 14,
  },
  bodyText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 20,
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 5,
  },
  flagEmoji: { fontSize: 12, marginTop: 2 },
  flagText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.navy,
    lineHeight: 19,
    flex: 1,
  },
  todoBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(34,197,94,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
    borderRadius: Radius.md,
    padding: 14,
  },
  todoEmoji: { fontSize: 16, flexShrink: 0 },
  todoText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.navy,
    lineHeight: 20,
    flex: 1,
  },

  /* CTA BANNER */
  ctaBanner: {
    marginHorizontal: 16,
    marginBottom: 28,
    backgroundColor: 'rgba(6,182,212,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.15)',
    borderRadius: Radius.xl,
    padding: 24,
    alignItems: 'center',
  },
  ctaTitle: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    color: Colors.navy,
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaSub: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  ctaBtn: {
    backgroundColor: Colors.cyan,
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: Radius.md,
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaBtnText: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: Colors.white,
  },
});