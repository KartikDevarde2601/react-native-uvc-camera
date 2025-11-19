import { UvcCameraView } from 'react-native-uvc-camera';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  PermissionsAndroid,
  Platform,
  Button,
} from 'react-native';

export default function App() {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        // Request multiple permissions at once
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          granted['android.permission.CAMERA'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('System permissions granted');
          setHasPermission(true);
        } else {
          console.log('Permissions denied');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      setHasPermission(true); // iOS handling would go here
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text>No Permission</Text>
        <Button title="Request Permission" onPress={requestPermissions} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>UVC Camera Preview</Text>
      {/* Only render the camera AFTER permission is granted */}
      <UvcCameraView
        style={{ width: '100%', height: 400, backgroundColor: 'black' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  header: {
    marginBottom: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
