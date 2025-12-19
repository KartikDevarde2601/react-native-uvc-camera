// Main component export
export { default as UvcCamera } from './UvcCamera';
export type { UvcCameraHandle } from './UvcCamera';
export { CameraErrorCodes } from './UvcCamera';
export type { CameraError, DeviceInfo } from './UvcCamera';

// Native component (advanced usage)
export { default as UvcCameraView } from './UvcCameraNativeComponent';
export type { UvcCameraViewType } from './UvcCameraNativeComponent';

// TurboModule (if needed for direct native access)
import UvcCameraModule from './NativeUvcCamera';
export { UvcCameraModule };

// Utility function (placeholder from template)
export function multiply(a: number, b: number): number {
  return UvcCameraModule.multiply(a, b);
}
