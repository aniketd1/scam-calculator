    import React, { useState } from 'react';
    import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Linking,
    } from 'react-native';
    import { SafeAreaView } from 'react-native-safe-area-context';
    import { useRouter } from 'expo-router';
    import Header from '../../components/Header';
    import Footer from '../../components/Footer';
    import { Colors, Fonts, Radius } from '../../constants/theme';

    /* ── DATA ─────────────────────────────────────────────────── */
    const questions = [
    { id: 'q0', question: 'Did an unknown person contact you?' },
    { id: 'q1', question: 'Did they claim to be an official — Government, Police, Bank, CBI, Courier, Loan, Customs etc?' },
    { id: 'q2', question: 'Did they mention something unexpected — fake loan, arrest, parcel, KYC, fake courier or fake refund received?' },
    { id: 'q3', question: 'Did they ask for Money, OTP, PIN, CVV, bank details, photo or Credit/Debit card details?' },
    { id: 'q4', question: 'Did they send a suspicious link, app or apk download, Website link, image download, QR code, or payment request?' },
    ];

    const tips = [
    'Banks never ask for OTPs over the phone.',
    'Receiving money never requires entering a PIN.',
    'Digital arrest is not a real legal procedure.',
    'Urgency and fear are scammer tools — slow down.',
    'Always verify by calling the official number directly.',
    ];

    const privacyTips = [
    'No data is stored after you close this page.',
    'No login or personal info is required.',
    'Your answers are never shared with anyone.',
    ];

    /* ── RISK ENGINE ─────────────────────────────────────────── */
    interface RiskLevel {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: string;
    advice: string;
    }

    function getRiskLevel(pct: number): RiskLevel {
    if (pct >= 80) return {
        label: 'CRITICAL RISK',
        color: Colors.redDark,
        bg: 'rgba(185,28,28,0.12)',
        border: 'rgba(185,28,28,0.3)',
        icon: '🚨',
        advice: 'Very likely a scam. Do not share anything. Call Cyber Crime Helpline on 1930 immediately. Report at cybercrime.gov.in.',
    };
    if (pct >= 60) return {
        label: 'HIGH RISK',
        color: Colors.red,
        bg: 'rgba(239,68,68,0.1)',
        border: 'rgba(239,68,68,0.3)',
        icon: '⚠️',
        advice: 'Likely a scam. Disconnect and report on cybercrime.gov.in.',
    };
    if (pct >= 40) return {
        label: 'MEDIUM RISK',
        color: Colors.amber,
        bg: 'rgba(245,158,11,0.1)',
        border: 'rgba(245,158,11,0.3)',
        icon: '🔍',
        advice: 'Some risk signs. Verify the phone number and ID independently before acting.',
    };
    return {
        label: 'LOW RISK',
        color: Colors.green,
        bg: 'rgba(34,197,94,0.1)',
        border: 'rgba(34,197,94,0.3)',
        icon: '✅',
        advice: "This doesn't appear to be a scam for now. Stay cautious.",
    };
    }

    /* ── SIDEBAR CARD ────────────────────────────────────────── */
    function SideCard({ title, items }: { title: string; items: string[] }) {
    return (
        <View style={sideStyles.card}>
        <Text style={sideStyles.title}>{title}</Text>
        {items.map((item, i) => (
            <View key={i} style={sideStyles.item}>
            <Text style={sideStyles.bullet}>💡</Text>
            <Text style={sideStyles.text}>{item}</Text>
            </View>
        ))}
        </View>
    );
    }

    const sideStyles = StyleSheet.create({
    card: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 18,
        marginBottom: 14,
    },
    title: {
        fontFamily: Fonts.heading,
        fontSize: 13,
        color: Colors.navy,
        marginBottom: 12,
    },
    item: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    bullet: { fontSize: 13, marginTop: 1 },
    text: {
        fontFamily: Fonts.body,
        fontSize: 13,
        color: Colors.subtle,
        lineHeight: 19,
        flex: 1,
    },
    });

    /* ── MAIN SCREEN ─────────────────────────────────────────── */
    export default function CalculatorScreen() {
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const score = Object.values(answers).filter(v => v === 'yes').length;
    const pct = score * 20;
    const risk = getRiskLevel(pct);
    const answered = Object.keys(answers).length;
    const complete = answered === questions.length;

    const handleSelect = (qid: string, value: string) => {
        setAnswers(prev => ({ ...prev, [qid]: value }));
    };

    const reset = () => {
        setAnswers({});
        setSubmitted(false);
    };

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
            <View style={styles.heroTag}>
                <Text style={styles.heroTagText}>⚡ RISK ENGINE</Text>
            </View>
            <Text style={styles.heroH1}>
                Scam <Text style={styles.accent}>Risk Calculator</Text>
            </Text>
            <Text style={styles.heroSub}>
                Answer 5 quick yes/no questions about the suspicious interaction. Our engine will assess the threat level and guide you on what to do next.
            </Text>
            </View>

            <View style={styles.layout}>
            {!submitted ? (
                <>
                {/* PROGRESS */}
                <View style={styles.progressWrap}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <View style={styles.progressTrack}>
                    <View
                        style={[
                        styles.progressFill,
                        { width: `${(answered / questions.length) * 100}%` as any },
                        ]}
                    />
                    </View>
                    <Text style={styles.progressCount}>{answered} / {questions.length}</Text>
                </View>

                {/* QUESTIONS */}
                {questions.map((q, i) => (
                    <View
                    key={q.id}
                    style={[
                        styles.qCard,
                        answers[q.id] !== undefined && styles.qCardAnswered,
                    ]}
                    >
                    <Text style={styles.qNumber}>QUESTION {i + 1} OF {questions.length}</Text>
                    <Text style={styles.qText}>{q.question}</Text>
                    <View style={styles.radioGroup}>
                        {(['yes', 'no'] as const).map(val => {
                        const selected = answers[q.id] === val;
                        return (
                            <TouchableOpacity
                            key={val}
                            style={[styles.radioOpt, selected && styles.radioOptSelected]}
                            onPress={() => handleSelect(q.id, val)}
                            >
                            <View style={[styles.radioDot, selected && styles.radioDotSelected]}>
                                {selected && <View style={styles.radioDotInner} />}
                            </View>
                            <Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>
                                {val.charAt(0).toUpperCase() + val.slice(1)}
                            </Text>
                            </TouchableOpacity>
                        );
                        })}
                    </View>
                    </View>
                ))}

                {/* SUBMIT */}
                <TouchableOpacity
                    style={[styles.submitBtn, !complete && styles.submitBtnDisabled]}
                    disabled={!complete}
                    onPress={() => setSubmitted(true)}
                >
                    <Text style={styles.submitBtnText}>
                    {complete
                        ? '⚡ Analyse My Risk Now'
                        : `Answer all questions to continue (${answered}/${questions.length})`}
                    </Text>
                </TouchableOpacity>

                {/* HELPLINE CARD */}
                <View style={styles.helplineCard}>
                    <Text style={styles.helplineSectionTitle}>🚨 Emergency Helpline</Text>
                    <Text style={styles.helplineNum}>1930</Text>
                    <Text style={styles.helplineLabel}>National Cyber Crime Helpline — 24/7</Text>
                    <TouchableOpacity style={styles.callNowBtn} onPress={() => Linking.openURL('tel:1930')}>
                    <Text style={styles.callNowBtnText}>📞 Call Now</Text>
                    </TouchableOpacity>
                </View>

                {/* TIPS */}
                <SideCard title="💡 Quick Tips" items={tips} />
                <SideCard title="🔒 Your Privacy" items={privacyTips} />
                </>
            ) : (
                <>
                {/* RESULT CARD */}
                <View
                    style={[
                    styles.resultCard,
                    { borderColor: risk.border, backgroundColor: risk.bg },
                    ]}
                >
                    <Text style={styles.resultIcon}>{risk.icon}</Text>
                    <Text style={[styles.resultLabel, { color: risk.color }]}>{risk.label}</Text>
                    <Text style={[styles.resultScore, { color: risk.color }]}>
                    {pct}<Text style={styles.resultScoreUnit}>%</Text>
                    </Text>
                    <Text style={styles.resultScoreSub}>Scam Risk Probability</Text>

                    {/* Score bar */}
                    <View style={styles.scoreBarTrack}>
                    <View
                        style={[
                        styles.scoreBarFill,
                        { width: `${pct}%` as any, backgroundColor: risk.color },
                        ]}
                    />
                    </View>

                    <View style={styles.resultAdvice}>
                    <Text style={styles.resultAdviceTitle}>What you should do:</Text>
                    <Text style={styles.resultAdviceText}>{risk.advice}</Text>
                    </View>

                    <View style={styles.resultActions}>
                    {score >= 3 && (
                        <TouchableOpacity
                        style={styles.btnReport}
                        onPress={() => Linking.openURL('https://cybercrime.gov.in')}
                        >
                        <Text style={styles.btnReportText}>📋 Report on cybercrime.gov.in</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.btnReset} onPress={reset}>
                        <Text style={styles.btnResetText}>↩ Start Over</Text>
                    </TouchableOpacity>
                    </View>
                </View>

                {/* Post-result helpline */}
                <View style={styles.helplineCard}>
                    <Text style={styles.helplineSectionTitle}>🚨 Emergency Helpline</Text>
                    <Text style={styles.helplineNum}>1930</Text>
                    <Text style={styles.helplineLabel}>National Cyber Crime Helpline — 24/7</Text>
                    <TouchableOpacity style={styles.callNowBtn} onPress={() => Linking.openURL('tel:1930')}>
                    <Text style={styles.callNowBtnText}>📞 Call Now</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.push('/')}>
                    <Text style={styles.backHomeBtnText}>← Back to Home</Text>
                </TouchableOpacity>
                </>
            )}
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

    hero: {
        padding: 24,
        paddingTop: 32,
        alignItems: 'center',
    },
    heroTag: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: 'rgba(6,182,212,0.1)',
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: 'rgba(6,182,212,0.2)',
        marginBottom: 14,
    },
    heroTagText: {
        fontFamily: Fonts.bodySemi,
        fontSize: 10,
        color: Colors.cyan,
        letterSpacing: 1,
    },
    heroH1: {
        fontFamily: Fonts.heading,
        fontSize: 26,
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
        maxWidth: 400,
    },

    layout: { padding: 16, gap: 0 },

    progressWrap: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    progressLabel: {
        fontFamily: Fonts.body,
        fontSize: 12,
        color: Colors.subtle,
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

    qCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 20,
        marginBottom: 12,
    },
    qCardAnswered: {
        borderColor: 'rgba(6,182,212,0.3)',
    },
    qNumber: {
        fontFamily: Fonts.bodySemi,
        fontSize: 10,
        color: Colors.slateLight,
        letterSpacing: 0.8,
        marginBottom: 8,
    },
    qText: {
        fontFamily: Fonts.heading,
        fontSize: 15,
        color: Colors.navy,
        lineHeight: 22,
        marginBottom: 16,
    },
    radioGroup: {
        flexDirection: 'row',
        gap: 10,
    },
    radioOpt: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: Radius.sm,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.bg,
    },
    radioOptSelected: {
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
    radioLabel: {
        fontFamily: Fonts.bodyMed,
        fontSize: 14,
        color: Colors.slateLight,
    },
    radioLabelSelected: {
        color: Colors.navy,
        fontFamily: Fonts.bodySemi,
    },

    submitBtn: {
        backgroundColor: Colors.cyan,
        paddingVertical: 15,
        borderRadius: Radius.md,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: Colors.cyan,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    submitBtnDisabled: {
        backgroundColor: '#b0d8e0',
        shadowOpacity: 0,
        elevation: 0,
    },
    submitBtnText: {
        fontFamily: Fonts.heading,
        fontSize: 15,
        color: Colors.white,
    },

    helplineCard: {
        backgroundColor: 'rgba(239,68,68,0.07)',
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.25)',
        padding: 18,
        marginBottom: 14,
        alignItems: 'center',
    },
    helplineSectionTitle: {
        fontFamily: Fonts.heading,
        fontSize: 13,
        color: Colors.navy,
        marginBottom: 4,
    },
    helplineNum: {
        fontFamily: Fonts.heading,
        fontSize: 36,
        color: Colors.red,
        letterSpacing: -1,
        lineHeight: 44,
    },
    helplineLabel: {
        fontFamily: Fonts.body,
        fontSize: 12,
        color: Colors.subtle,
        marginBottom: 12,
    },
    callNowBtn: {
        backgroundColor: Colors.red,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: Radius.md,
    },
    callNowBtnText: {
        fontFamily: Fonts.bodyBold,
        fontSize: 14,
        color: Colors.white,
    },

    resultCard: {
        borderRadius: Radius.xl,
        borderWidth: 1.5,
        padding: 28,
        alignItems: 'center',
        marginBottom: 16,
    },
    resultIcon: { fontSize: 44, marginBottom: 12 },
    resultLabel: {
        fontFamily: Fonts.heading,
        fontSize: 20,
        letterSpacing: -0.3,
        marginBottom: 8,
    },
    resultScore: {
        fontFamily: Fonts.heading,
        fontSize: 52,
        letterSpacing: -2,
    },
    resultScoreUnit: {
        fontSize: 22,
        fontFamily: Fonts.headingMed,
    },
    resultScoreSub: {
        fontFamily: Fonts.body,
        fontSize: 12,
        color: Colors.muted,
        marginBottom: 16,
    },
    scoreBarTrack: {
        width: '100%',
        height: 10,
        backgroundColor: '#e6e9ef',
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 20,
    },
    scoreBarFill: {
        height: '100%',
        borderRadius: 5,
    },
    resultAdvice: {
        width: '100%',
        backgroundColor: Colors.bg,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 16,
        marginBottom: 16,
    },
    resultAdviceTitle: {
        fontFamily: Fonts.bodyBold,
        fontSize: 13,
        color: Colors.navy,
        marginBottom: 5,
    },
    resultAdviceText: {
        fontFamily: Fonts.body,
        fontSize: 13,
        color: Colors.slate,
        lineHeight: 20,
    },
    resultActions: { width: '100%', gap: 10 },
    btnReport: {
        backgroundColor: Colors.red,
        paddingVertical: 13,
        borderRadius: Radius.md,
        alignItems: 'center',
    },
    btnReportText: {
        fontFamily: Fonts.bodyBold,
        fontSize: 14,
        color: Colors.white,
    },
    btnReset: {
        paddingVertical: 12,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    btnResetText: {
        fontFamily: Fonts.bodyMed,
        fontSize: 14,
        color: Colors.slateLight,
    },
    backHomeBtn: {
        marginTop: 4,
        marginBottom: 16,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    backHomeBtnText: {
        fontFamily: Fonts.bodyMed,
        fontSize: 14,
        color: Colors.muted,
    },  
    });