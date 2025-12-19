import { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  StatusBar,
  Alert,
  Image,
  Text,
} from 'react-native';

import { UvcCamera, type UvcCameraHandle } from 'react-native-uvc-camera';

export default function App() {
  // ============================================================
  // 1. ALL HOOKS MUST BE AT THE TOP (Always in the same order)
  // ============================================================

  // Hook 1: Permission State
  const [hasPermission, setHasPermission] = useState(false);

  // Hook 2: Captured Image State (The new one you added)
  const [capturedUri, setCapturedUri] = useState<string | null>(null);

  // Hook 3: Camera Reference
  const cameraRef = useRef<UvcCameraHandle>(null);

  // Hook 4: Effect for Permissions
  useEffect(() => {
    checkPermissions();
  }, []);

  // ============================================================
  // 2. HELPER FUNCTIONS
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

  const handleCapturePress = async () => {
    if (cameraRef.current) {
      try {
        const { uri } = await cameraRef.current.takePicture();
        setCapturedUri(uri);
      } catch (e) {
        console.error('Failed to take picture:', e);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const handleRetake = () => {
    setCapturedUri(null);
  };

  // ============================================================
  // 3. CONDITIONAL RETURNS (MUST BE AFTER ALL HOOKS)
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
      <UvcCamera
        ref={cameraRef}
        style={styles.camera}
      />
      <View style={styles.overlay}>
        <TouchableOpacity onPress={handleCapturePress} style={styles.btnOuter}>
          <View style={styles.btnInner} />
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
  btnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
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
});
