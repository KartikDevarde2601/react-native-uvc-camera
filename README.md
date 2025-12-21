# @kartik512/react-native-uvc-camera

[![npm version](https://badge.fury.io/js/%40kartik512%2Freact-native-uvc-camera.svg)](https://www.npmjs.com/package/@kartik512/react-native-uvc-camera)
[![Platform - Android](https://img.shields.io/badge/platform-Android-3ddc84.svg?style=flat&logo=android)](https://www.android.com)
[![Expo Compatible](https://img.shields.io/badge/Expo-SDK%2050+-4630eb.svg?style=flat&logo=expo)](https://expo.dev)

UVC Camera support for React Native - Access and control USB Video Class cameras on Android.

## Features

- 📷 Connect to UVC (USB Video Class) cameras on Android
- 🎥 Live camera preview with real-time streaming
- 📸 Capture images with promise-based API
- ⚙️ Device info and comprehensive error handling
- 🔌 USB disconnect detection with automatic cleanup
- 📱 **Expo support** (v0.2.0+) with config plugin for automatic setup

## Platform Support

| Platform | Supported |
|----------|-----------|
| Android  | ✅ Yes    |
| iOS      | ❌ No (UVC not supported on iOS) |

> **Note**: This library is Android-only as iOS does not support USB Video Class (UVC) cameras through its SDK.

## Installation

```sh
npm install @kartik512/react-native-uvc-camera
# or
yarn add @kartik512/react-native-uvc-camera
```

### Expo Setup (Recommended for v0.2.0+)

For **Expo projects** (SDK 50+), the library includes a config plugin that automatically configures your Android project.

1. Add the plugin to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [
      "@kartik512/react-native-uvc-camera"
    ]
  }
}
```

2. Run prebuild to generate native projects:

```sh
npx expo prebuild
```

The config plugin automatically adds:
- `android.hardware.usb.host` feature requirement
- `CAMERA` permission
- `USB_PERMISSION` declaration

#### Plugin Options

You can customize the plugin with options:

```json
{
  "expo": {
    "plugins": [
      ["@kartik512/react-native-uvc-camera", {
        "cameraPermissionText": "Custom message for camera permission"
      }]
    ]
  }
}
```

### Bare React Native / Manual Setup

For **bare React Native projects**, add USB host feature to your `AndroidManifest.xml`:

```xml
<uses-feature android:name="android.hardware.usb.host" android:required="true" />
<uses-permission android:name="android.permission.CAMERA" />
```

## Usage

```tsx
import React, { useRef } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import UvcCamera, { 
  type UvcCameraHandle, 
  type DeviceInfo, 
  type CameraError 
} from '@kartik512/react-native-uvc-camera';

function App() {
  const cameraRef = useRef<UvcCameraHandle>(null);

  const handleCameraReady = (device: DeviceInfo) => {
    console.log('Camera connected:', device.deviceName);
    console.log('Vendor ID:', device.vendorId);
    console.log('Product ID:', device.productId);
  };

  const handleCameraError = (error: CameraError) => {
    console.error('Camera error:', error.code, error.message);
  };

  const handleDeviceDisconnected = () => {
    console.log('Camera disconnected');
  };

  const takePicture = async () => {
    try {
      const result = await cameraRef.current?.takePicture();
      console.log('Picture saved at:', result?.uri);
    } catch (error) {
      console.error('Failed to take picture:', error);
    }
  };

  return (
    <View style={styles.container}>
      <UvcCamera
        ref={cameraRef}
        style={styles.camera}
        captureTimeout={10000}
        onCameraReady={handleCameraReady}
        onCameraError={handleCameraError}
        onDeviceDisconnected={handleDeviceDisconnected}
      />
      <Button title="Take Picture" onPress={takePicture} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
});

export default App;
```

## API Reference

### UvcCamera Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `style` | `ViewStyle` | - | View container style |
| `captureTimeout` | `number` | `10000` | Timeout in ms for picture capture |
| `onCameraReady` | `(device: DeviceInfo) => void` | - | Called when camera connects |
| `onCameraError` | `(error: CameraError) => void` | - | Called on camera error |
| `onDeviceDisconnected` | `() => void` | - | Called when device disconnects |

### UvcCameraHandle Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `takePicture()` | `Promise<{ uri: string }>` | Captures a picture and returns file URI |

### Types

```typescript
type DeviceInfo = {
  deviceName: string;
  vendorId: number;
  productId: number;
};

type CameraError = {
  code: number;
  message: string;
};

// Error codes
const CameraErrorCodes = {
  CAMERA_OPEN_FAILED: 1,
  CAMERA_DISCONNECTED: 2,
  CAPTURE_FAILED: 3,
  PERMISSION_DENIED: 4,
  NO_DEVICE_FOUND: 5,
};
```

## Requirements

- React Native >= 0.71
- Android with USB Host support
- UVC compatible USB camera

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
