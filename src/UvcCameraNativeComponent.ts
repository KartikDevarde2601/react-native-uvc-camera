import { codegenNativeComponent, type ViewProps } from 'react-native';
import type { HostComponent } from 'react-native';

interface NativeProps extends ViewProps {
  // We will add props like 'captureMode' or 'deviceId' later.
  // For now, leaving this empty means just a plain view.
}

export default codegenNativeComponent<NativeProps>(
  'UvcCameraView'
) as HostComponent<NativeProps>;
