import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Radius } from '../constants/theme';

const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Calculator', path: '/calculator' },
  { label: 'Awareness', path: '/awareness' },
  { label: 'Report a Scam', path: '/report' },
  { label: 'Verification', path: '/verification' },
];

export default function Footer() {
  const router = useRouter();
  const year = new Date().getFullYear();

  const navigate = (path: string) => {
    if (path === '/') router.push('/');
    else router.push(path as any);
  };

  return (
    <View style={styles.root}>
      {/* Main 3 columns stacked on mobile */}
      <View style={styles.main}>

        {/* Brand */}
        <View style={styles.col}>
          <TouchableOpacity style={styles.brandRow} onPress={() => navigate('/')}>
            <View style={styles.logoIcon}>
              <Text style={{ fontSize: 15 }}>🛡️</Text>
            </View>
            <Text style={styles.logoText}>
              Scam<Text style={styles.logoAccent}>Risk</Text>
            </Text>
          </TouchableOpacity>
          <Text style={styles.tagline}>
            Empowering India's citizens — especially seniors and banking users — to detect, understand, and report digital scams before they cause harm.
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🔒 Privacy-First · No Login Required</Text>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.col}>
          <Text style={styles.colTitle}>QUICK LINKS</Text>
          {quickLinks.map(({ label, path }) => (
            <TouchableOpacity key={path} style={styles.linkRow} onPress={() => navigate(path)}>
              <View style={styles.linkDot} />
              <Text style={styles.linkText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency */}
        <View style={styles.col}>
          <Text style={styles.colTitle}>EMERGENCY HELP</Text>
          <View style={styles.helplineBox}>
            <Text style={styles.helplineNumber}>1930</Text>
            <Text style={styles.helplineLabel}>National Cyber Crime Helpline</Text>
            <Text style={styles.helplineDesc}>
              Call immediately if you've been scammed. Available 24/7. Report within the first hour for best recovery chances.
            </Text>
          </View>
          <TouchableOpacity style={styles.reportBtn} onPress={() => navigate('/report')}>
            <Text style={styles.reportBtnText}>📋 File Online Report →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom bar */}
      <View style={styles.bottom}>
        <Text style={styles.copy}>
          © {year} ScamRisk. Built for safer digital India.{' '}
        </Text>
        <Text style={styles.disclaimer}>
          This tool provides risk guidance only. It does not record calls or store personal data. For legal matters, contact cybercrime.gov.in.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#e8dccb',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  main: {
    padding: 28,
    gap: 32,
  },
  col: {
    gap: 0,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    color: Colors.navy,
  },
  logoAccent: {
    color: Colors.blue,
  },
  tagline: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.slateLight,
    lineHeight: 22,
    marginBottom: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(6,182,212,0.08)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.18)',
  },
  badgeText: {
    fontFamily: Fonts.bodySemi,
    fontSize: 12,
    color: Colors.cyanDark,
  },
  colTitle: {
    fontFamily: Fonts.heading,
    fontSize: 12,
    color: Colors.navy,
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  linkDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  linkText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.slateLight,
  },
  helplineBox: {
    backgroundColor: 'rgba(254,215,215,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244,114,182,0.12)',
    borderRadius: Radius.md,
    padding: 16,
    marginBottom: 12,
  },
  helplineNumber: {
    fontFamily: Fonts.heading,
    fontSize: 32,
    color: '#be123c',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  helplineLabel: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.slateLight,
    marginBottom: 8,
  },
  helplineDesc: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.slateLight,
    lineHeight: 20,
  },
  reportBtn: {
    backgroundColor: Colors.cyan,
    paddingVertical: 12,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  reportBtnText: {
    fontFamily: Fonts.bodySemi,
    fontSize: 14,
    color: Colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 20,
  },
  bottom: {
    padding: 20,
    gap: 6,
  },
  copy: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.muted,
  },
  disclaimer: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.slateLight,
    lineHeight: 17,
  },
});