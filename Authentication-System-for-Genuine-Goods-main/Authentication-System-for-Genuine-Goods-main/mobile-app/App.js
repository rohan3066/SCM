
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform, TextInput, ScrollView, KeyboardAvoidingView, Image } from 'react-native';
import React, { useState } from 'react';
import Toast from 'react-native-toast-message';

import ScannerView from './src/components/ScannerView';
import VerificationResult from './src/components/VerificationResult';
import { verifyProductOnBlockchain } from './src/utils/ethereum';
import { API_URL } from './src/constants/config';

// Theme Colors
const THEME = {
  background: '#111827',
  card: '#1F2937',
  primary: '#F97316', // Orange-500
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#374151',
  inputBg: '#374151', // Lighter Gray for Input
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('HOME');
  const [isLoading, setIsLoading] = useState(false);

  const [manufacturerCode, setManufacturerCode] = useState('');
  const [productCode, setProductCode] = useState('');
  const [consumerKey, setConsumerKey] = useState('');

  const [verificationResult, setVerificationResult] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [productImage2, setProductImage2] = useState(null);

  const startScan = () => {
    setManufacturerCode('');
    setProductCode('');
    setConsumerKey('');
    setVerificationResult(null);
    setProductImage2(null);
    setCurrentScreen('SCANNER');
  };

  const cancelScan = () => {
    setCurrentScreen('HOME');
  };

  const handleScan = async (data) => {
    try {
      console.log("Scanned Data:", data);
      const parts = data.trim().split(" ");

      if (parts.length >= 2) {
        const brand = parts[0];
        const id = parts.slice(1).join(" ");

        setManufacturerCode(brand);
        setProductCode(id);
        setCurrentScreen('FORM');
        Toast.show({
          type: 'success',
          text1: 'Product Scanned',
          text2: 'Please enter your Secret Key.'
        });
      } else {
        setManufacturerCode("");
        setProductCode(data);
        setCurrentScreen('FORM');
        Toast.show({
          type: 'info',
          text1: 'Scanned',
          text2: 'Please verify details and enter key.'
        });
      }
    } catch (error) {
      console.error("Scan Parse Error:", error);
      Toast.show({
        type: 'error',
        text1: 'Scan Error',
        text2: 'Could not parse QR code.'
      });
      setCurrentScreen('HOME');
    }
  };

  const handleVerify = async () => {
    if (!manufacturerCode || !productCode) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please scan a valid product.'
      });
      return;
    }

    setIsLoading(true);
    let result = { success: false, isValid: false, message: "Verification failed.", manufacturerAddress: null };
    let productStatusBackend = null;

    try {
      // 1. Fetch Product Status from Backend
      try {
        const statusUrl = `${API_URL}/product-status?brand=${encodeURIComponent(manufacturerCode)}&product_id=${encodeURIComponent(productCode)}`;
        console.log("Fetching status from:", statusUrl);
        const statusResponse = await fetch(statusUrl);

        console.log("Status Fetch Response:", statusResponse.status);

        if (statusResponse.ok) {
          try {
            productStatusBackend = await statusResponse.json();
            console.log("Product Status:", productStatusBackend);
          } catch (jsonErr) {
            console.error("JSON Parse Error for Status:", jsonErr);
            // Proceed without status if JSON fails
          }
        } else {
          console.log("Status fetch failed with status:", statusResponse.status);
          const errorText = await statusResponse.text();
          console.log("Status fetch error text:", errorText);
        }
      } catch (statusErr) {
        console.error("Failed to fetch product status (Network/Other):", statusErr);
      }

      // 2. Perform Blockchain Verification (only if key is provided)
      if (consumerKey) {
        try {
          result = await verifyProductOnBlockchain(manufacturerCode, productCode, consumerKey);
        } catch (bcError) {
          console.error("Blockchain verification error:", bcError);
          result = { success: false, message: "Blockchain verification failed.", error: bcError.message };
        }
      } else {
        result = { success: false, isValid: false, message: "Secret Key not provided.", skipped: true };
      }

      // 3. Check for "Sold but Wrong Code" case
      if (!result.isValid) {
        if (productStatusBackend && productStatusBackend.status === 'sold_to_consumer') {
          result.message = "Product is sold but not authentic because code is wrong";
          // Keep success/isValid as false to show Red alert, but update message
        } else if (!consumerKey) {
          result.message = "Secret Key not provided. Only checking status.";
        }
      }

      // 4. Fetch Images
      try {
        // Only fetch image if we have some level of success or just want to show what we have
        console.log(`Fetching image from ${API_URL}/product-image/${productCode}...`);
        const response = await fetch(`${API_URL}/product-image/${encodeURIComponent(productCode)}`);

        if (response.ok) {
          const imgData = await response.json();
          if (imgData.imageUrl) setProductImage(imgData.imageUrl);
          if (imgData.imageUrl2) setProductImage2(imgData.imageUrl2);
        }
      } catch (imgError) {
        console.error("Failed to fetch product image:", imgError);
      }

      // Combine results
      setVerificationResult({
        ...result,
        productStatus: productStatusBackend
      });
      setCurrentScreen('RESULT');

    } catch (error) {
      console.error("Verification Process Error:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setManufacturerCode('');
    setProductCode('');
    setConsumerKey('');
    setVerificationResult(null);
    setProductImage(null);
    setProductImage2(null);
    setCurrentScreen('HOME');
  };

  if (currentScreen === 'SCANNER') {
    return (
      <>
        <ScannerView onScanned={handleScan} onCancel={cancelScan} />
        <Toast />
      </>
    );
  }

  if (currentScreen === 'RESULT' && verificationResult) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <VerificationResult
          result={verificationResult}
          productImage={productImage}
          productImage2={productImage2}
          onReset={reset}
        />
        <Toast />
      </SafeAreaView>
    );
  }

  if (currentScreen === 'FORM') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>Verify Attributes</Text>

            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Brand Name</Text>
                <TextInput
                  style={styles.input}
                  value={manufacturerCode}
                  onChangeText={setManufacturerCode}
                  placeholder="e.g. Nike"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Product ID</Text>
                <TextInput
                  style={styles.input}
                  value={productCode}
                  onChangeText={setProductCode}
                  placeholder="e.g. PROD-123"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Secret Key (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={consumerKey}
                  onChangeText={setConsumerKey}
                  placeholder="Enter key to verify authenticity"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
                <Text style={styles.helperText}>Leave empty to check sold status only.</Text>
              </View>
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color={THEME.primary} style={styles.loader} />
            ) : (
              <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={reset}>
                  <Text style={styles.cancelBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.verifyBtn]} onPress={handleVerify}>
                  <Text style={styles.buttonText}>Verify Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
        <Toast />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        {/* Logo or Icon can go here */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>SG</Text>
        </View>

        <Text style={styles.brandTitle}>SoleGuard</Text>
        <Text style={styles.subtitle}>Premium Authenticator</Text>

        <View style={styles.divider} />

        <Text style={styles.description}>
          Verify the authenticity of your genuine goods using the security of blockchain technology.
        </Text>

        <TouchableOpacity style={styles.scanButton} onPress={startScan}>
          <Text style={styles.buttonText}>Scan Product Tag</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.manualLink} onPress={() => setCurrentScreen('FORM')}>
          <Text style={styles.manualLinkText}>Enter Details Manually</Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    paddingTop: Platform.OS === "android" ? 30 : 0
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  logoText: {
    color: THEME.primary,
    fontSize: 32,
    fontWeight: '900',
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: THEME.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  divider: {
    width: 40,
    height: 4,
    backgroundColor: THEME.primary,
    marginBottom: 32,
    borderRadius: 2,
  },
  description: {
    fontSize: 16,
    color: THEME.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
    maxWidth: '80%',
  },
  scanButton: {
    backgroundColor: THEME.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  manualLink: {
    padding: 12,
  },
  manualLinkText: {
    color: THEME.textSecondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },

  // Form Screen
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 24,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 24,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    backgroundColor: THEME.inputBg,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    color: 'white',
  },
  helperText: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtn: {
    backgroundColor: THEME.primary,
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  cancelBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  loader: {
    marginTop: 20
  },
});
