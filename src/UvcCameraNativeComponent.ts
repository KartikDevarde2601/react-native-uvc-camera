import {
  codegenNativeComponent,
  codegenNativeCommands,
  type ViewProps,
} from 'react-native';
import type { HostComponent } from 'react-native';
import type { CodegenTypes } from 'react-native';

// Event types - using CodegenTypes.Int32 for integer values as required by codegen
type PictureTakenEvent = Readonly<{ uri: string }>;

type CameraErrorEvent = Readonly<{
  code: CodegenTypes.Int32;
  message: string;
}>;

type CameraReadyEvent = Readonly<{
  deviceName: string;
  vendorId: CodegenTypes.Int32;
  productId: CodegenTypes.Int32;
}>;

type DeviceDisconnectedEvent = Readonly<{}>;

interface NativeProps extends ViewProps {
  onPictureTaken?: CodegenTypes.DirectEventHandler<PictureTakenEvent>;
  onCameraError?: CodegenTypes.DirectEventHandler<CameraErrorEvent>;
  onCameraReady?: CodegenTypes.DirectEventHandler<CameraReadyEvent>;
  onDeviceDisconnected?: CodegenTypes.DirectEventHandler<DeviceDisconnectedEvent>;
}

export type UvcCameraViewType = HostComponent<NativeProps>;

interface NativeCommands {
  takePicture: (viewRef: React.ElementRef<UvcCameraViewType>) => void;
}

// Export the Commands object
export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['takePicture'],
});

export default codegenNativeComponent<NativeProps>(
  'UvcCameraView'
) as HostComponent<NativeProps>;
