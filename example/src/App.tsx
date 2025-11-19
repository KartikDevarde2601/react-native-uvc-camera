import { Text, View, StyleSheet } from 'react-native';
import { multiply, UvcCameraView } from 'react-native-uvc-camera';

const result = multiply(3, 7);

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
      <View style={styles.container}>
        <UvcCameraView color="red" style={styles.box} />
        <UvcCameraView color="yellow" style={styles.box} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
