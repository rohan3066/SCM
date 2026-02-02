
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const { width } = Dimensions.get('window');
const SCAN_FRAME_SIZE = width * 0.7;

// SoleGuard Colors
const THEME = {
    primary: '#F97316', // Orange-500
    dark: '#111827',    // Gray-900
};

export default function ScannerView({ onScanned, onCancel }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        setScanned(false);
    }, []);

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.text}>Camera permission is required to verify products.</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onCancel}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarCodeScanned = ({ data }) => {
        if (scanned) return;
        setScanned(true);
        onScanned(data);
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                onBarcodeScanned={handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            >
                <View style={styles.overlay}>
                    <View style={styles.topOverlay}>
                        <Text style={styles.scanTitle}>Scan Product Tag</Text>
                    </View>

                    <View style={styles.middleRow}>
                        <View style={styles.sideOverlay} />
                        <View style={styles.frame}>
                            {/* Corner Borders */}
                            <View style={[styles.corner, styles.cornerTL]} />
                            <View style={[styles.corner, styles.cornerTR]} />
                            <View style={[styles.corner, styles.cornerBL]} />
                            <View style={[styles.corner, styles.cornerBR]} />

                            {/* Scanning Line Animation (Static for now, could be animated) */}
                            <View style={styles.scanLine} />
                        </View>
                        <View style={styles.sideOverlay} />
                    </View>

                    <View style={styles.bottomOverlay}>
                        <Text style={styles.hintText}>Align QR code within the frame</Text>
                        <TouchableOpacity style={styles.cancelPill} onPress={onCancel}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        backgroundColor: THEME.dark,
    },
    camera: {
        flex: 1,
    },
    text: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
    },
    button: {
        backgroundColor: THEME.primary,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 12,
        marginBottom: 16,
        width: '100%',
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: '#374151',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },

    // Overlay
    overlay: {
        flex: 1,
    },
    topOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 40,
    },
    scanTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    middleRow: {
        flexDirection: 'row',
        height: SCAN_FRAME_SIZE,
    },
    sideOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    frame: {
        width: SCAN_FRAME_SIZE,
        height: SCAN_FRAME_SIZE,
        justifyContent: 'space-between',
        position: 'relative',
    },
    bottomOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 40,
    },
    hintText: {
        color: '#9CA3AF',
        fontSize: 14,
        marginBottom: 30,
    },
    cancelPill: {
        paddingVertical: 10,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    cancelText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },

    // Corners
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: THEME.primary,
        borderWidth: 4,
    },
    cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
    cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
    cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
    cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

    scanLine: {
        width: '100%',
        height: 2,
        backgroundColor: THEME.primary,
        position: 'absolute',
        top: '50%',
        opacity: 0.5,
    }
});
