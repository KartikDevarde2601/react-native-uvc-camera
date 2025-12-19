import React from 'react';
import { create, act } from 'react-test-renderer';
import UvcCamera from '../UvcCamera';
import { Commands } from '../UvcCameraNativeComponent';

// Mock the native component and commands
jest.mock('../UvcCameraNativeComponent', () => {
  const ReactLib = require('react');
  class NativeComponent extends ReactLib.Component {
    render() {
      return ReactLib.createElement('UvcCameraView', this.props);
    }
  }
  return {
    __esModule: true,
    default: NativeComponent,
    Commands: {
      takePicture: jest.fn(),
    },
  };
});

describe('UvcCamera', () => {
  it('takePicture resolves with uri when onPictureTaken is called', async () => {
    const ref = React.createRef<any>();
    let renderer: any;
    await act(async () => {
      renderer = create(<UvcCamera ref={ref} />);
    });
    const instance = renderer.root;

    // Simulate calling takePicture
    const promise = ref.current?.takePicture();

    // Verify native command was called
    expect(Commands.takePicture).toHaveBeenCalled();

    // Find the native component to simulate event
    // We look for the element that has onPictureTaken prop
    const nativeComponent = instance.find(
      (node: any) => node.props.onPictureTaken
    );

    // Simulate onPictureTaken event
    const uri = 'file://test.jpg';
    act(() => {
      nativeComponent.props.onPictureTaken({ nativeEvent: { uri } });
    });

    // Verify promise resolves
    const result = await promise;
    expect(result).toEqual({ uri });
  });
});
