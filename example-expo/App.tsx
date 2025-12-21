import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { PermissionsAndroid } from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Platform } from 'react-native';
import { Image } from 'react-native';
import { TouchableOpacity } from 'react-native';
import {
  UvcCamera,
  type UvcCameraHandle,
  type CameraError,
  type DeviceInfo,
  CameraErrorCodes,
} from '@kartik512/react-native-uvc-camera';

export default function App() {
  const [hasPermission, setHasPermission] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ============================================================
  // 2. REFS
  // ============================================================

  const cameraRef = useRef<UvcCameraHandle>(null);

  // ============================================================
  // 3. EFFECTS
  // ============================================================

  useEffect(() => {
    checkPermissions();
  }, []);

  // Clear error message after 3 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [errorMessage]);

  // ============================================================
  // 4. PERMISSION HANDLING
  // ============================================================

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
      if (
        granted['android.permission.CAMERA'] ===
        PermissionsAndroid.RESULTS.GRANTED
      ) {
        setHasPermission(true);
      }
    } else {
      setHasPermission(true);
    }
  };

  // ============================================================
  // 5. CAMERA EVENT HANDLERS
  // ============================================================

  const handleCameraReady = useCallback((device: DeviceInfo) => {
    console.log('Camera ready:', device);
    setDeviceInfo(device);
    setErrorMessage(null);
  }, []);

  const handleCameraError = useCallback((error: CameraError) => {
    console.error('Camera error:', error);

    let message = error.message;
    switch (error.code) {
      case CameraErrorCodes.NO_DEVICE_FOUND:
        message = 'No UVC camera found. Please connect a USB camera.';
        break;
      case CameraErrorCodes.PERMISSION_DENIED:
        message = 'USB permission denied. Please allow access when prompted.';
        break;
      case CameraErrorCodes.CAPTURE_FAILED:
        message = 'Failed to capture image. Please try again.';
        break;
    }

    setErrorMessage(message);
    setIsCapturing(false);
  }, []);

  const handleDeviceDisconnected = useCallback(() => {
    console.log('Camera disconnected');
    setDeviceInfo(null);
    setCapturedUri(null);
    setErrorMessage('Camera disconnected. Please reconnect.');
  }, []);

  // ============================================================
  // 6. ACTION HANDLERS
  // ============================================================

  const handleCapturePress = async () => {
    if (cameraRef.current && !isCapturing) {
      setIsCapturing(true);
      try {
        const { uri } = await cameraRef.current.takePicture();
        setCapturedUri(uri);
      } catch (e) {
        console.error('Failed to take picture:', e);
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        Alert.alert('Capture Failed', errorMsg);
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const handleRetake = () => {
    setCapturedUri(null);
  };

  // ============================================================
  // 7. RENDER
  // ============================================================

  // Check 1: Permissions
  if (!hasPermission) return <View style={styles.blackBg} />;

  // Check 2: Preview Mode (Show Image)
  if (capturedUri) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <Image
          source={{ uri: capturedUri }}
          style={styles.previewImage}
          resizeMode="contain"
        />
        <View style={styles.previewOverlay}>
          <TouchableOpacity onPress={handleRetake} style={styles.retakeButton}>
            <Text style={styles.btnText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Alert.alert('Saved', `Path: ${capturedUri}`)}
            style={styles.saveButton}
          >
            <Text style={styles.btnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Check 3: Camera Mode (Default)
  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Error Banner */}
      {errorMessage && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {/* Device Info */}
      {deviceInfo && (
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceInfoText}>📷 {deviceInfo.deviceName}</Text>
        </View>
      )}

      <UvcCamera
        ref={cameraRef}
        style={styles.camera}
        captureTimeout={15000}
        onCameraReady={handleCameraReady}
        onCameraError={handleCameraError}
        onDeviceDisconnected={handleDeviceDisconnected}
      />

      <View style={styles.overlay}>
        <TouchableOpacity
          onPress={handleCapturePress}
          style={[styles.btnOuter, isCapturing && styles.btnCapturing]}
          disabled={isCapturing}
        >
          <View
            style={[styles.btnInner, isCapturing && styles.btnInnerCapturing]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  blackBg: { flex: 1, backgroundColor: 'black' },
  container: { flex: 1, backgroundColor: 'black' },
  camera: { flex: 1, width: '100%' },
  overlay: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
  },
  btnOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  btnCapturing: {
    borderColor: '#888',
  },
  btnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  btnInnerCapturing: {
    backgroundColor: '#888',
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  previewImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 20,
    elevation: 20,
  },
  retakeButton: {
    backgroundColor: '#FF4444',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  btnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  errorBanner: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 68, 68, 0.9)',
    padding: 12,
    borderRadius: 8,
    zIndex: 100,
    elevation: 100,
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  deviceInfo: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    borderRadius: 8,
    zIndex: 50,
    elevation: 50,
  },
  deviceInfoText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
});
