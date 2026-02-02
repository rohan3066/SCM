
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const THEME = {
    dark: '#111827',     // Gray-900 (Background)
    card: '#1F2937',     // Gray-800 (Card)
    text: '#F3F4F6',     // Gray-100
    textMuted: '#9CA3AF', // Gray-400
    success: '#10B981',  // Green-500
    error: '#EF4444',    // Red-500
    primary: '#F97316',  // Orange-500
};

export default function VerificationResult({ result, productImage, productImage2, onReset }) {
    const isAuthentic = result?.isValid;
    const isSuccess = result?.success;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {isSuccess ? (
                <>
                    <View style={styles.iconContainer}>
                        <View style={[styles.circle, isAuthentic ? styles.bgSuccess : styles.bgError]}>
                            <Text style={styles.iconText}>{isAuthentic ? "✓" : "!"}</Text>
                        </View>
                    </View>

                    <Text style={[styles.statusTitle, isAuthentic ? styles.textSuccess : styles.textError]}>
                        {isAuthentic ? "Authentic Product" : "Potential Counterfeit"}
                    </Text>
                    <Text style={styles.statusMessage}>
                        {isAuthentic
                            ? "Verified on the Ethereum blockchain."
                            : "This product failed verification checks."}
                    </Text>

                    {/* Images Section */}
                    {productImage || productImage2 ? (
                        <View style={styles.imageSection}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageScroll}>
                                {productImage && (
                                    <View style={styles.imageCard}>
                                        <Image source={{ uri: productImage }} style={styles.productImage} resizeMode="contain" />
                                        {productImage2 && <Text style={styles.imageLabel}>Front View</Text>}
                                    </View>
                                )}
                                {productImage2 && (
                                    <View style={[styles.imageCard, { marginLeft: productImage ? 16 : 0 }]}>
                                        <Image source={{ uri: productImage2 }} style={styles.productImage} resizeMode="contain" />
                                        <Text style={styles.imageLabel}>Side/Back View</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    ) : (
                        isAuthentic && <Text style={styles.noImageText}>No product images available.</Text>
                    )}

                    <View style={styles.detailsCard}>
                        <Text style={styles.cardHeader}>Blockchain Verification</Text>

                        <View style={styles.row}>
                            <Text style={styles.label}>Status:</Text>
                            <View style={[styles.badge, isAuthentic ? styles.badgeSuccess : styles.badgeError]}>
                                <Text style={[styles.badgeText, isAuthentic ? styles.textSuccess : styles.textError]}>
                                    {isAuthentic ? "VERIFIED" : "FAILED"}
                                </Text>
                            </View>
                        </View>

                        {result.manufacturerAddress && (
                            <View style={styles.rowColumn}>
                                <Text style={styles.label}>Contract Address:</Text>
                                <Text style={styles.valueSmall} numberOfLines={1} ellipsizeMode="middle">
                                    {result.manufacturerAddress}
                                </Text>
                            </View>
                        )}
                    </View>
                </>
            ) : (
                <View style={styles.errorContainer}>
                    <View style={[styles.circle, styles.bgError]}>
                        <Text style={styles.iconText}>X</Text>
                    </View>
                    <Text style={styles.statusTitle}>Error</Text>
                    <Text style={styles.statusMessage}>{result.message || "An unknown error occurred."}</Text>
                    {result.error && <Text style={styles.debugText}>{result.error}</Text>}
                </View>
            )}

            <TouchableOpacity style={styles.button} onPress={onReset}>
                <Text style={styles.buttonText}>Scan Another</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 24,
        backgroundColor: THEME.dark,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginBottom: 20,
    },
    circle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    iconText: {
        fontSize: 48,
        color: 'white',
        fontWeight: 'bold',
    },
    bgSuccess: {
        backgroundColor: THEME.success,
    },
    bgError: {
        backgroundColor: THEME.error,
    },
    statusTitle: {
        fontSize: 26,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    textSuccess: {
        color: THEME.success,
    },
    textError: {
        color: THEME.error,
    },
    statusMessage: {
        fontSize: 16,
        color: THEME.textMuted,
        textAlign: 'center',
        marginBottom: 32,
    },
    imageSection: {
        marginBottom: 32,
        height: 240,
    },
    imageScroll: {
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    imageCard: {
        width: 220,
        height: 220,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
    },
    productImage: {
        width: '100%',
        height: '90%',
    },
    imageLabel: {
        fontSize: 10,
        color: '#6B7280',
        marginTop: 4,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    noImageText: {
        color: THEME.textMuted,
        fontStyle: 'italic',
        marginBottom: 32,
    },
    detailsCard: {
        width: '100%',
        backgroundColor: THEME.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#374151',
    },
    cardHeader: {
        fontSize: 18,
        fontWeight: '700',
        color: THEME.text,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
        paddingBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    rowColumn: {
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        color: THEME.textMuted,
        fontWeight: '600',
        marginBottom: 4,
    },
    badge: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    badgeSuccess: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    badgeError: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    valueSmall: {
        fontSize: 13,
        fontFamily: 'monospace',
        color: THEME.text,
        backgroundColor: '#111827',
        padding: 8,
        borderRadius: 6,
        overflow: 'hidden',
    },
    button: {
        backgroundColor: THEME.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    errorContainer: {
        alignItems: 'center',
        marginBottom: 32,
        width: '100%',
    },
    debugText: {
        fontSize: 12,
        color: THEME.textMuted,
        marginTop: 12,
        textAlign: 'center',
        backgroundColor: '#111827',
        padding: 8,
        borderRadius: 4,
    }
});
