import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { Colors, Fonts, Radius } from '../constants/theme';

interface NavLink {
  label: string;
  path: string;
}

const navLinks: NavLink[] = [
  { label: 'Home', path: '/' },
  { label: 'Calculator', path: '/calculator' },
  { label: 'Report', path: '/report' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (path: string) => {
    setMenuOpen(false);
    if (path === '/') router.push('/');
    else router.push(path as any);
  };

  return (
    <>
    <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgCard }}>
      <View style={styles.nav}>
        {/* Logo */}
        <TouchableOpacity style={styles.logo} onPress={() => navigate('/')}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>🛡️</Text>
          </View>
          <Text style={styles.logoText}>
            Scam<Text style={styles.logoAccent}>Risk</Text>
          </Text>
        </TouchableOpacity>

        {/* Desktop-style links (shown on wider tablets) */}
        <View style={styles.navLinksRow}>
          {navLinks.map(({ label, path }) => {
            const active = pathname === path || (path !== '/' && pathname.startsWith(path));
            return (
              <TouchableOpacity
                key={path}
                style={[styles.navLink, active && styles.navLinkActive]}
                onPress={() => navigate(path)}
              >
                <Text style={[styles.navLinkText, active && styles.navLinkTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CTA + Hamburger */}
        <View style={styles.navRight}>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => navigate('/calculator')}>
            <Text style={styles.ctaText}>⚡ Check Risk</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.hamburger} onPress={() => setMenuOpen(true)}>
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </TouchableOpacity>
        </View>
      </View>
      </SafeAreaView>
      {/* Mobile Menu Modal */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)}>
          <Pressable style={styles.menuBox} onPress={e => e.stopPropagation()}>
            <View style={styles.menuHeader}>
              <TouchableOpacity style={styles.logo} onPress={() => navigate('/')}>
                <View style={styles.logoIcon}>
                  <Text style={styles.logoEmoji}>🛡️</Text>
                </View>
                <Text style={styles.logoText}>
                  Scam<Text style={styles.logoAccent}>Risk</Text>
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setMenuOpen(false)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {navLinks.map(({ label, path }) => {
                const active = pathname === path;
                return (
                  <TouchableOpacity
                    key={path}
                    style={[styles.mobileLink, active && styles.mobileLinkActive]}
                    onPress={() => navigate(path)}
                  >
                    <Text style={[styles.mobileLinkText, active && styles.mobileLinkTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity style={styles.mobileCta} onPress={() => navigate('/calculator')}>
                <Text style={styles.mobileCtaText}>⚡ Check Scam Risk</Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  nav: {
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,    
    paddingBottom: 14,
    zIndex: 100,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: Colors.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 16 },
  logoText: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: Colors.navy,
    letterSpacing: -0.3,
  },
  logoAccent: {
    color: Colors.blue,
  },
  navLinksRow: {
    flexDirection: 'row',
    gap: 4,
    display: 'none' as any,
  },
  navLink: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.sm,
  },
  navLinkActive: {
    backgroundColor: 'rgba(6,182,212,0.08)',
  },
  navLinkText: {
    fontFamily: Fonts.bodyMed,
    fontSize: 14,
    color: Colors.navy,
  },
  navLinkTextActive: {
    color: Colors.cyanDark,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ctaBtn: {
    backgroundColor: Colors.cyan,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.md,
  },
  ctaText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: Colors.white,
  },
  hamburger: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
    backgroundColor: 'rgba(6,182,212,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  hamburgerLine: {
    width: 18,
    height: 2,
    backgroundColor: Colors.navy,
    borderRadius: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 90 : 70,
    paddingHorizontal: 14,
  },
  menuBox: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(15,23,42,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: Colors.muted,
    fontFamily: Fonts.bodyMed,
  },
  mobileLink: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    marginBottom: 4,
    backgroundColor: 'rgba(6,182,212,0.03)',
  },
  mobileLinkActive: {
    backgroundColor: 'rgba(6,182,212,0.1)',
  },
  mobileLinkText: {
    fontFamily: Fonts.bodyMed,
    fontSize: 15,
    color: Colors.navy,
  },
  mobileLinkTextActive: {
    color: Colors.cyanDark,
  },
  mobileCta: {
    backgroundColor: Colors.cyan,
    paddingVertical: 13,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: 8,
  },
  mobileCtaText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: Colors.white,
  },
});