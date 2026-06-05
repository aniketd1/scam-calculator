import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Radius } from '../constants/theme';

const infoItems = [
  { icon: '🔒', label: 'Security Updates' },
  { icon: '⚡', label: 'Performance Improvements' },
  { icon: '🤖', label: 'AI Feature Enhancements' },
];

export default function MaintenanceScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <View style={styles.card}>

          {/* Icon */}
          <Text style={styles.mainIcon}>🛠️</Text>

          {/* Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>SYSTEM MAINTENANCE</Text>
          </View>

          {/* Heading */}
          <Text style={styles.heading}>Under{'\n'}Maintenance</Text>

          {/* Body */}
          <Text style={styles.body}>
            We're currently improving Scam2Safe to provide a better experience.{'\n'}
            Please check back shortly.
          </Text>

          {/* Info chips */}
          <View style={styles.infoRow}>
            {infoItems.map(item => (
              <View key={item.label} style={styles.infoChip}>
                <Text style={styles.infoIcon}>{item.icon}</Text>
                <Text style={styles.infoLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Emergency note */}
          <Text style={styles.emergencyNote}>
            If you've been scammed, call{' '}
            <Text
              style={styles.emergencyLink}
              onPress={() => Linking.openURL('tel:1930')}
            >
              1930
            </Text>
            {' '}or visit{' '}
            <Text
              style={styles.emergencyLink}
              onPress={() => Linking.openURL('https://cybercrime.gov.in')}
            >
              cybercrime.gov.in
            </Text>
          </Text>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.bgCard,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.15)',
    padding: 32,
    alignItems: 'center',
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },

  /* Icon */
  mainIcon: {
    fontSize: 52,
    marginBottom: 16,
  },

  /* Badge */
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(6,182,212,0.1)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
    marginBottom: 20,
  },
  badgeText: {
    fontFamily: Fonts.bodySemi,
    fontSize: 10,
    color: Colors.cyan,
    letterSpacing: 1.2,
  },

  /* Heading */
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 34,
    color: Colors.navy,
    letterSpacing: -0.8,
    lineHeight: 40,
    textAlign: 'center',
    marginBottom: 14,
  },

  /* Body */
  body: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
  },

  /* Info chips */
  infoRow: {
    width: '100%',
    gap: 10,
    marginBottom: 24,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.bg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoIcon: { fontSize: 18 },
  infoLabel: {
    fontFamily: Fonts.bodyMed,
    fontSize: 14,
    color: Colors.navy,
  },

  /* Divider */
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 18,
  },

  /* Emergency note */
  emergencyNote: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  emergencyLink: {
    fontFamily: Fonts.bodySemi,
    color: Colors.red,
  },
});