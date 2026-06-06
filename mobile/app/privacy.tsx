import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Colors, Fonts, Radius } from '../constants/theme';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* ── DATA ─────────────────────────────────────────────────── */
interface ContentItem {
  heading: string;
  body: string;
}

interface Section {
  id: string;
  icon: string;
  title: string;
  content: ContentItem[];
}

const sections: Section[] = [
  {
    id: 'collection',
    icon: '📋',
    title: 'Information We Collect',
    content: [
      { heading: 'What We Do NOT Collect', body: 'We do not collect your name, phone number, email address, Aadhaar, PAN, bank account details, or any personally identifiable information unless you voluntarily submit a contact form.' },
      { heading: 'Anonymous Usage Data', body: 'We may collect non-identifiable analytics such as page visits and country-level location data to understand how users interact with the platform and improve our services.' },
      { heading: 'Contact Form Submissions', body: 'If you use our Contact page, we collect the name and email address you provide solely for the purpose of responding to your inquiry. This data is never sold, shared, or used for marketing.' },
    ],
  },
  {
    id: 'calculator',
    icon: '⚡',
    title: 'How the Calculator Handles Your Data',
    content: [
      { heading: 'Session-Only Processing', body: 'All answers you enter in the Scam Risk Calculator are processed entirely within your device session. No answers are transmitted to our servers or stored in any database.' },
      { heading: 'Auto-Deletion on Close', body: 'When you close the app, all calculator data is automatically cleared. There is no data retention of any kind.' },
      { heading: 'No User Profiling', body: 'We do not build profiles based on your answers. Your results are generated in real-time and discarded immediately after display.' },
    ],
  },
  {
    id: 'cookies',
    icon: '🍪',
    title: 'Cookies & Tracking',
    content: [
      { heading: 'Minimal Cookie Usage', body: 'We use only essential cookies required for basic site functionality (such as session state). We do not use advertising cookies, tracking pixels, or third-party analytics that identify individuals.' },
      { heading: 'No Advertising Networks', body: 'ScamRisk is an ad-free platform. We do not integrate with Google Ads, Meta Pixel, or any advertising network that could track you across websites.' },
      { heading: 'Your Cookie Control', body: 'You can control cookie preferences through your device settings. Disabling cookies will not affect the core functionality of the Risk Calculator.' },
    ],
  },
  {
    id: 'sharing',
    icon: '🤝',
    title: 'Data Sharing & Third Parties',
    content: [
      { heading: 'We Never Sell Your Data', body: 'ScamRisk does not sell, rent, or trade any user data to any third party under any circumstances. This is a non-negotiable commitment.' },
      { heading: 'No Third-Party Data Brokers', body: 'We do not work with data brokers, lead generation platforms, or any service that aggregates personal data for commercial purposes.' },
      { heading: 'Legal Compliance Only', body: 'The only circumstance under which we would share data is if required by valid Indian law enforcement authority with a proper legal order.' },
    ],
  },
  {
    id: 'security',
    icon: '🔐',
    title: 'Security Measures',
    content: [
      { heading: 'HTTPS Encryption', body: 'All data transmitted between your device and our servers is encrypted using industry-standard TLS/HTTPS protocols.' },
      { heading: 'No Sensitive Data Storage', body: 'Since we do not collect sensitive data, there is nothing to breach. Our architecture is designed around data minimisation by default.' },
      { heading: 'Regular Security Audits', body: 'Our platform undergoes periodic security reviews to identify and address potential vulnerabilities before they can be exploited.' },
    ],
  },
  {
    id: 'rights',
    icon: '⚖️',
    title: 'Your Rights',
    content: [
      { heading: 'Right to Access', body: 'If you submitted a contact form, you may request to know what data we hold about you by emailing help@scamrisk.in.' },
      { heading: 'Right to Deletion', body: 'You may request deletion of any contact form data we hold. We will process your request within 7 working days.' },
      { heading: 'Right to Withdraw Consent', body: 'You may withdraw consent for analytics data at any time by adjusting your device settings.' },
    ],
  },
];

const promises = [
  { icon: '🚫', text: 'No Login Required' },
  { icon: '🗑️', text: 'Data Auto-Deleted' },
  { icon: '🎙️', text: 'No Recording' },
  { icon: '💰', text: 'Never Sold' },
];

/* ── ACCORDION SECTION CARD ──────────────────────────────── */
function SectionCard({ section }: { section: Section }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(e => !e);
  };

  return (
    <View style={card.wrap}>
      {/* Header row — always visible, tappable */}
      <TouchableOpacity style={card.header} onPress={toggle} activeOpacity={0.7}>
        <View style={card.iconWrap}>
          <Text style={card.icon}>{section.icon}</Text>
        </View>
        <Text style={card.title}>{section.title}</Text>
        <Text style={[card.chevron, expanded && card.chevronOpen]}>›</Text>
      </TouchableOpacity>

      {/* Expandable body */}
      {expanded && (
        <View style={card.body}>
          <View style={card.divider} />
          {section.content.map((c, i) => (
            <View key={c.heading} style={[card.item, i < section.content.length - 1 && card.itemBorder]}>
              <Text style={card.itemHeading}>{c.heading}</Text>
              <Text style={card.itemBody}>{c.body}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const card = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(6,182,212,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: { fontSize: 20 },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: Colors.navy,
    flex: 1,
    lineHeight: 20,
  },
  chevron: {
    fontFamily: Fonts.bodyBold,
    fontSize: 22,
    color: Colors.subtle,
    transform: [{ rotate: '0deg' }],
    lineHeight: 26,
  },
  chevronOpen: {
    transform: [{ rotate: '90deg' }],
    color: Colors.cyan,
  },
  body: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 16,
  },
  item: {
    paddingBottom: 14,
    marginBottom: 14,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  itemHeading: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    color: Colors.navy,
    marginBottom: 5,
  },
  itemBody: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.slateLight,
    lineHeight: 21,
  },
});

/* ── MAIN SCREEN ─────────────────────────────────────────── */
export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 0 }}
      >
        {/* ── HERO ── */}
        <View style={styles.hero}>
          <View style={styles.heroTag}>
            <Text style={styles.heroTagText}>🔒 PRIVACY POLICY</Text>
          </View>
          <Text style={styles.heroH1}>
            Your Privacy Is Our <Text style={styles.accent}>Promise</Text>
          </Text>
          <Text style={styles.heroSub}>
            ScamRisk is built on a foundation of zero data collection. This policy explains exactly what we do — and don't do — with your information.
          </Text>
          <Text style={styles.heroMeta}>Last updated: January 2025 · Effective immediately</Text>
        </View>

        {/* ── PROMISE STRIP ── */}
        <View style={styles.promiseStrip}>
          <View style={styles.promiseGrid}>
            {promises.map(p => (
              <View key={p.text} style={styles.promiseItem}>
                <Text style={styles.promiseIcon}>{p.icon}</Text>
                <Text style={styles.promiseText}>{p.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── QUICK NAV (TOC-like chips) ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tocScroll}
        >
          {sections.map(s => (
            <View key={s.id} style={styles.tocChip}>
              <Text style={styles.tocChipText}>{s.icon} {s.title}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ── SECTIONS ── */}
        <View style={styles.sectionsWrap}>
          <Text style={styles.sectionsLabel}>TAP ANY SECTION TO EXPAND</Text>
          {sections.map(s => (
            <SectionCard key={s.id} section={s} />
          ))}
        </View>

        {/* ── FOOTER NOTE ── */}
        <View style={styles.footerNote}>
          <Text style={styles.footerNoteIcon}>📬</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.footerNoteText}>
              Questions about this privacy policy? Contact us at{' '}
              <Text
                style={styles.footerNoteLink}
                onPress={() => Linking.openURL('mailto:help@scamrisk.in')}
              >
                help@scamrisk.in
              </Text>
              {' '}or visit our{' '}
              <Text
                style={styles.footerNoteLink}
                onPress={() => router.push('/contact' as any)}
              >
                Contact page
              </Text>
              . This policy may be updated periodically — we'll always note the effective date at the top of this page.
            </Text>
          </View>
        </View>

        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  /* HERO */
  hero: {
    padding: 28,
    paddingTop: 40,
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  heroTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.22)',
    marginBottom: 14,
  },
  heroTagText: {
    fontFamily: Fonts.bodySemi,
    fontSize: 10,
    color: Colors.green,
    letterSpacing: 0.9,
  },
  heroH1: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: Colors.navy,
    letterSpacing: -0.5,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 12,
  },
  accent: { color: Colors.green },
  heroSub: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.subtle,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 360,
    marginBottom: 10,
  },
  heroMeta: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.slateLight,
  },

  /* PROMISE STRIP */
  promiseStrip: {
    backgroundColor: Colors.bgAlt,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    padding: 16,
  },
  promiseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  promiseItem: {
    width: '47%',
    backgroundColor: 'rgba(34,197,94,0.06)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.18)',
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  promiseIcon: { fontSize: 22 },
  promiseText: {
    fontFamily: Fonts.bodySemi,
    fontSize: 12,
    color: Colors.green,
    textAlign: 'center',
  },

  /* TOC CHIPS */
  tocScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tocChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  tocChipText: {
    fontFamily: Fonts.bodyMed,
    fontSize: 12,
    color: Colors.muted,
  },

  /* SECTIONS */
  sectionsWrap: {
    padding: 16,
    paddingTop: 8,
  },
  sectionsLabel: {
    fontFamily: Fonts.bodySemi,
    fontSize: 10,
    color: Colors.subtle,
    letterSpacing: 0.9,
    marginBottom: 12,
  },

  /* FOOTER NOTE */
  footerNote: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: 'rgba(6,182,212,0.05)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.15)',
  },
  footerNoteIcon: { fontSize: 20, flexShrink: 0, marginTop: 1 },
  footerNoteText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 21,
  },
  footerNoteLink: {
    color: Colors.cyan,
    fontFamily: Fonts.bodySemi,
  },
});