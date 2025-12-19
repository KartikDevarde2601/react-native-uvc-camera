import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import { type ViewProps } from 'react-native';
import UvcCameraNativeComponent, {
  Commands,
} from './UvcCameraNativeComponent';

type UvcCameraProps = ViewProps & {
  // Add any other props here if needed in the future
};

export type UvcCameraHandle = {
  takePicture: () => Promise<{ uri: string }>;
};

const UvcCamera = forwardRef<UvcCameraHandle, UvcCameraProps>((props, ref) => {
  const nativeRef = useRef<React.ElementRef<typeof UvcCameraNativeComponent>>(null);
  const pendingPromiseRef = useRef<{
    resolve: (value: { uri: string }) => void;
    reject: (reason?: any) => void;
  } | null>(null);

  useImperativeHandle(ref, () => ({
    takePicture: () => {
      return new Promise((resolve, reject) => {
        if (pendingPromiseRef.current) {
          reject(new Error('Another picture request is already pending.'));
          return;
        }
        pendingPromiseRef.current = { resolve, reject };
        if (nativeRef.current) {
          Commands.takePicture(nativeRef.current);
        } else {
            pendingPromiseRef.current = null;
            reject(new Error('Native camera view is not ready.'));
        }
      });
    },
  }));

  const onPictureTaken = useCallback((event: { nativeEvent: { uri: string } }) => {
    const { uri } = event.nativeEvent;
    if (pendingPromiseRef.current) {
      pendingPromiseRef.current.resolve({ uri });
      pendingPromiseRef.current = null;
    }
  }, []);

  return (
    <UvcCameraNativeComponent
      ref={nativeRef}
      {...props}
      onPictureTaken={onPictureTaken}
    />
  );
});

export default UvcCamera;
