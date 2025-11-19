import UvcCamera from './NativeUvcCamera';
export { default as UvcCameraView } from './UvcCameraNativeComponent';
export * from './UvcCameraNativeComponent';

export function multiply(a: number, b: number): number {
  return UvcCamera.multiply(a, b);
}
