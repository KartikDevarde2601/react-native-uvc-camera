import {
  codegenNativeComponent,
  codegenNativeCommands,
  type ViewProps,
} from 'react-native';
import type { HostComponent } from 'react-native';
import type { CodegenTypes } from 'react-native';
import React from 'react';

// 1. FIX: Change 'url' to 'uri' to match Android standard
type PictureTakenEvent = Readonly<{ uri: string }>;

interface NativeProps extends ViewProps {
  onPictureTaken?: CodegenTypes.DirectEventHandler<PictureTakenEvent>;
}

export type UvcCameraViewType = HostComponent<NativeProps>;

interface NativeCommands {
  takePicture: (viewRef: React.ElementRef<UvcCameraViewType>) => void;
}

// 2. Export the Commands object
export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['takePicture'],
});

export default codegenNativeComponent<NativeProps>(
  'UvcCameraView'
) as HostComponent<NativeProps>;
