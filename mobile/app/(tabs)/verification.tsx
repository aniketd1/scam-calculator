import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Colors, Fonts, Radius } from '../../constants/theme';

/* ── DATA ─────────────────────────────────────────────────── */
const categories = [
  'All', 'Job Portals', 'Loan & Finance', 'Banking',
  'Government', 'Insurance', 'Investment', 'Courier & Delivery',
];

const companies = [
  { id: 1,  category: 'Job Portals',       icon: '💼', name: 'Naukri',                  desc: "India's largest job portal for professionals across all industries.",                   url: 'https://www.naukri.com',                                    badge: 'Most Popular' },
  { id: 2,  category: 'Job Portals',       icon: '💼', name: 'LinkedIn Jobs',            desc: 'Professional networking and job listings with verified employer profiles.',             url: 'https://www.linkedin.com/jobs',                             badge: null },
  { id: 3,  category: 'Job Portals',       icon: '💼', name: 'Indeed India',             desc: 'Aggregated job listings from thousands of verified employer websites.',                 url: 'https://in.indeed.com',                                     badge: null },
  { id: 4,  category: 'Job Portals',       icon: '💼', name: 'Shine.com',               desc: 'Job portal focused on Indian mid-level and senior professionals.',                      url: 'https://www.shine.com',                                     badge: null },
  { id: 5,  category: 'Job Portals',       icon: '💼', name: 'Freshersworld',            desc: 'Dedicated portal for fresher and entry-level job seekers in India.',                   url: 'https://www.freshersworld.com',                             badge: null },
  { id: 6,  category: 'Loan & Finance',    icon: '🏦', name: 'BankBazaar',              desc: 'RBI-registered platform to compare and apply for loans, cards, and insurance.',        url: 'https://www.bankbazaar.com',                                badge: 'RBI Registered' },
  { id: 7,  category: 'Loan & Finance',    icon: '🏦', name: 'Paisabazaar',             desc: 'Aggregator for personal loans, home loans, and credit score checks.',                  url: 'https://www.paisabazaar.com',                               badge: null },
  { id: 8,  category: 'Loan & Finance',    icon: '🏦', name: 'HDFC Bank Loans',         desc: 'Official HDFC Bank portal for personal, home, and vehicle loans.',                    url: 'https://www.hdfcbank.com/personal/loans',                   badge: null },
  { id: 9,  category: 'Loan & Finance',    icon: '🏦', name: 'SBI Loans',               desc: 'Official State Bank of India loan products and application portal.',                   url: 'https://sbi.co.in/web/personal-banking/loans',              badge: 'Government Bank' },
  { id: 10, category: 'Banking',           icon: '🏛️', name: 'SBI Online',              desc: "Official online banking portal for India's largest public sector bank.",               url: 'https://www.onlinesbi.sbi',                                 badge: 'Government Bank' },
  { id: 11, category: 'Banking',           icon: '🏛️', name: 'HDFC Bank',               desc: 'Official portal for HDFC Bank accounts, cards, and digital banking.',                 url: 'https://www.hdfcbank.com',                                  badge: null },
  { id: 12, category: 'Banking',           icon: '🏛️', name: 'ICICI Bank',              desc: 'Official ICICI Bank internet and mobile banking platform.',                            url: 'https://www.icicibank.com',                                 badge: null },
  { id: 13, category: 'Banking',           icon: '🏛️', name: 'Axis Bank',               desc: 'Official Axis Bank digital banking and account management portal.',                   url: 'https://www.axisbank.com',                                  badge: null },
  { id: 14, category: 'Banking',           icon: '🏛️', name: 'RBI',                     desc: 'Central bank — file complaints, check registered NBFCs, and verify lenders.',        url: 'https://www.rbi.org.in',                                    badge: 'Central Bank' },
  { id: 15, category: 'Government',        icon: '🇮🇳', name: 'Cyber Crime Portal',       desc: 'Official government portal to report online fraud and cybercrime.',                   url: 'https://cybercrime.gov.in',                                 badge: 'Official' },
  { id: 16, category: 'Government',        icon: '🇮🇳', name: 'UIDAI (Aadhaar)',          desc: 'Official Aadhaar authority — update details, lock biometrics, check status.',        url: 'https://uidai.gov.in',                                      badge: 'Official' },
  { id: 17, category: 'Government',        icon: '🇮🇳', name: 'Income Tax e-Filing',      desc: 'Official portal for filing income tax returns and viewing refund status.',            url: 'https://www.incometax.gov.in',                              badge: 'Official' },
  { id: 18, category: 'Government',        icon: '🇮🇳', name: 'EPFO (PF Portal)',         desc: 'Official Employees\' Provident Fund portal for balance, withdrawal, and KYC.',       url: 'https://www.epfindia.gov.in',                               badge: 'Official' },
  { id: 19, category: 'Government',        icon: '🇮🇳', name: 'Umang Portal',             desc: 'Government services aggregator — PF, PAN, Aadhaar and more in one place.',           url: 'https://web.umang.gov.in',                                  badge: 'Official' },
  { id: 20, category: 'Insurance',         icon: '🛡️', name: 'PolicyBazaar',             desc: 'IRDAI-registered aggregator for comparing health, life, and vehicle insurance.',      url: 'https://www.policybazaar.com',                              badge: 'IRDAI Registered' },
  { id: 21, category: 'Insurance',         icon: '🛡️', name: 'LIC India',               desc: 'Official Life Insurance Corporation of India portal for policy and claims.',          url: 'https://licindia.in',                                       badge: 'Government' },
  { id: 22, category: 'Insurance',         icon: '🛡️', name: 'IRDAI (Regulator)',        desc: 'Official insurance regulator — verify your insurer and file complaints.',             url: 'https://irdai.gov.in',                                      badge: 'Official Regulator' },
  { id: 23, category: 'Insurance',         icon: '🛡️', name: 'Star Health Insurance',    desc: 'Official portal for health insurance plans and cashless claim requests.',             url: 'https://www.starhealth.in',                                 badge: null },
  { id: 24, category: 'Investment',        icon: '📈', name: 'SEBI (Regulator)',         desc: 'Official market regulator — verify brokers, file complaints, investor education.',    url: 'https://www.sebi.gov.in',                                   badge: 'Official Regulator' },
  { id: 25, category: 'Investment',        icon: '📈', name: 'NSE India',                desc: 'Official National Stock Exchange portal for market data and investor tools.',         url: 'https://www.nseindia.com',                                  badge: null },
  { id: 26, category: 'Investment',        icon: '📈', name: 'Zerodha',                  desc: 'SEBI-registered discount broker and investment platform for stocks and MF.',          url: 'https://zerodha.com',                                       badge: 'SEBI Registered' },
  { id: 27, category: 'Investment',        icon: '📈', name: 'Groww',                    desc: 'SEBI-registered platform for mutual funds, stocks, and digital gold.',               url: 'https://groww.in',                                          badge: 'SEBI Registered' },
  { id: 28, category: 'Investment',        icon: '📈', name: 'AMFI (Mutual Funds)',       desc: 'Official mutual fund regulator — verify fund houses and distributor credentials.',    url: 'https://www.amfiindia.com',                                 badge: 'Official' },
  { id: 29, category: 'Courier & Delivery',icon: '📦', name: 'India Post',               desc: 'Official India Post tracking and postal service portal.',                             url: 'https://www.indiapost.gov.in',                              badge: 'Government' },
  { id: 30, category: 'Courier & Delivery',icon: '📦', name: 'DTDC',                     desc: 'Official DTDC courier tracking and shipment booking portal.',                         url: 'https://www.dtdc.in',                                       badge: null },
  { id: 31, category: 'Courier & Delivery',icon: '📦', name: 'Blue Dart',                desc: 'Official Blue Dart express delivery and parcel tracking portal.',                     url: 'https://www.bluedart.com',                                  badge: null },
  { id: 32, category: 'Courier & Delivery',icon: '📦', name: 'Amazon Tracking',          desc: 'Official and only legitimate source for tracking Amazon India orders.',               url: 'https://www.amazon.in/gp/your-account/order-history',       badge: null },
  { id: 33, category: 'Courier & Delivery',icon: '📦', name: 'Delhivery',                desc: 'Official Delhivery parcel tracking for e-commerce shipments.',                        url: 'https://www.delhivery.com',                                 badge: null },
];

type BadgeStyle = { bg: string; border: string; color: string };

const badgeStyles: Record<string, BadgeStyle> = {
  'Official':          { bg: 'rgba(6,182,212,0.10)',  border: 'rgba(6,182,212,0.25)',  color: Colors.cyan },
  'Official Regulator':{ bg: 'rgba(6,182,212,0.10)',  border: 'rgba(6,182,212,0.25)',  color: Colors.cyan },
  'Government':        { bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.25)',  color: Colors.green },
  'Government Bank':   { bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.25)',  color: Colors.green },
  'Central Bank':      { bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.25)',  color: Colors.green },
  'RBI Registered':    { bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)', color: Colors.amber },
  'IRDAI Registered':  { bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)', color: Colors.amber },
  'SEBI Registered':   { bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)', color: Colors.amber },
  'Most Popular':      { bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.25)', color: '#8B5CF6' },
};

/* ── SCREEN ───────────────────────────────────────────────── */
export default function VerifiedScreen() {
  const [active, setActive] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = companies.filter(c => {
    const matchCat = active === 'All' || c.category === active;
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

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
            <Text style={styles.pgTagText}>✅ VERIFIED SOURCES</Text>
          </View>
          <Text style={styles.h1}>
            Go to the{' '}
            <Text style={styles.accent}>Right Place</Text>
            {', '}Not a Fake One
          </Text>
          <Text style={styles.heroSub}>
            Official links to trusted Indian portals — so you're never redirected to a scam site.
          </Text>

          {/* Search */}
          <View style={styles.searchWrap}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or category..."
              placeholderTextColor={Colors.subtle}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* WARNING STRIP */}
        <View style={styles.warning}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            <Text style={styles.warningBold}>Stay safe: </Text>
            Always check the URL in your browser matches exactly before entering any personal or financial information.
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

        {/* COUNT */}
        <Text style={styles.countText}>
          Showing{' '}
          <Text style={styles.countNum}>{filtered.length}</Text>
          {' '}verified {filtered.length === 1 ? 'source' : 'sources'}
          {active !== 'All' ? ` in ${active}` : ''}
          {search ? ` matching "${search}"` : ''}
        </Text>

        {/* CARDS */}
        <View style={styles.cardList}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No results found. Try a different search or category.</Text>
            </View>
          ) : (
            filtered.map(c => {
              const bs = c.badge ? (badgeStyles[c.badge] ?? badgeStyles['Official']) : null;
              const domain = c.url.replace('https://', '').replace('http://', '').split('/')[0];
              return (
                <TouchableOpacity
                  key={c.id}
                  style={styles.card}
                  onPress={() => Linking.openURL(c.url)}
                  activeOpacity={0.75}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.cardIconWrap}>
                      <Text style={styles.cardIcon}>{c.icon}</Text>
                    </View>
                    <Text style={styles.cardName}>{c.name}</Text>
                    <Text style={styles.verifiedTick}>✓</Text>
                  </View>
                  <Text style={styles.cardDesc}>{c.desc}</Text>
                  <View style={styles.cardFooter}>
                    {bs ? (
                      <View style={[styles.badge, { backgroundColor: bs.bg, borderColor: bs.border }]}>
                        <Text style={[styles.badgeText, { color: bs.color }]}>{c.badge}</Text>
                      </View>
                    ) : (
                      <View />
                    )}
                    <Text style={styles.domainText}>{domain} →</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
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
  },
  pgTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
    marginBottom: 14,
  },
  pgTagText: {
    fontFamily: Fonts.bodySemi,
    fontSize: 10,
    color: Colors.green,
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
    marginBottom: 18,
  },

  /* SEARCH */
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: { fontSize: 14 },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.navy,
    paddingVertical: 12,
  },

  /* WARNING */
  warning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    borderRadius: Radius.md,
    padding: 12,
  },
  warningIcon: { fontSize: 13, marginTop: 1 },
  warningText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.navy,
    lineHeight: 18,
    flex: 1,
  },
  warningBold: { fontFamily: Fonts.bodySemi },

  /* FILTER */
  filterBar: {
    paddingHorizontal: 16,
    paddingVertical: 14,
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

  /* COUNT */
  countText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.subtle,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  countNum: {
    fontFamily: Fonts.bodySemi,
    color: Colors.cyan,
  },

  /* CARDS */
  cardList: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 28,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 8,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardIcon: { fontSize: 20 },
  cardName: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    color: Colors.navy,
    flex: 1,
  },
  verifiedTick: {
    fontFamily: Fonts.bodySemi,
    fontSize: 14,
    color: Colors.green,
  },
  cardDesc: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 19,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: Fonts.bodySemi,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  domainText: {
    fontFamily: Fonts.bodyMed,
    fontSize: 11,
    color: Colors.subtle,
  },

  /* EMPTY */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: { fontSize: 32, marginBottom: 10 },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.muted,
    textAlign: 'center',
  },
});