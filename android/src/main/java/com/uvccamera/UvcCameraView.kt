package com.uvccamera

import android.content.Context
import android.hardware.usb.UsbDevice
import android.util.AttributeSet
import android.util.Log
import android.view.SurfaceHolder
import android.widget.FrameLayout
import androidx.annotation.Size
import com.herohan.uvcapp.CameraException
import com.herohan.uvcapp.CameraHelper
import com.herohan.uvcapp.ICameraHelper
import com.serenegiant.widget.AspectRatioSurfaceView

class UvcCameraView @JvmOverloads constructor(
  context: Context,
  attrs: AttributeSet? = null
) : FrameLayout(context, attrs) {


  private lateinit var cameraViewMain: AspectRatioSurfaceView
  private var cameraHelper: ICameraHelper? = null

  private final val DEBUG: Boolean= true;

  companion object {
    private const val TAG = "UvcCameraView"
  }

  init {
    setupView()
  }

  private fun setupView() {
    // 1. Create the SurfaceView programmatically
    cameraViewMain = AspectRatioSurfaceView(context).apply {
      setAspectRatio(640, 480)
    }

    // 2. Add it to this FrameLayout
    addView(cameraViewMain)

    // 3. Setup Surface Callbacks
    cameraViewMain.holder.addCallback(object : SurfaceHolder.Callback {
      override fun surfaceCreated(holder: SurfaceHolder) {
        cameraHelper?.addSurface(holder.surface, false)
      }

      override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
        // Handle rotation/resize if needed
      }

      override fun surfaceDestroyed(holder: SurfaceHolder) {
        cameraHelper?.removeSurface(holder.surface)
      }
    })
  }

  // Called when React Native attaches this view to the screen
  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    initCameraHelper()
  }

  override fun onDetachedFromWindow() {
    clearCameraHelper()
    super.onDetachedFromWindow()
  }



  private fun clearCameraHelper() {
    cameraHelper?.release()
    cameraHelper = null
  }


  private fun initCameraHelper() {
    if (cameraHelper == null) {
      cameraHelper = CameraHelper().apply {
        setStateCallback(stateListener)
      }
    }

    // AUTO-START LOGIC: Pick the first available USB device
    val deviceList = cameraHelper?.deviceList
    deviceList?.firstOrNull()?.let { device ->
      Log.d(TAG, "Found device: ${device.deviceName}")
      cameraHelper?.selectDevice(device)
    } ?: Log.d(TAG, "No USB device found.")
  }


  private val stateListener = object : ICameraHelper.StateCallback{
    override fun onAttach(device: UsbDevice?) {
      // handle hot-plugging
      if(DEBUG) Log.v(TAG,"onAttach:device" + device?.deviceName)
      cameraHelper?.selectDevice(device)
    }

    override fun onDeviceOpen(device: UsbDevice?, isFirstOpen: Boolean) {
      if(DEBUG) Log.v(TAG,"onDeviceOpen" + device?.deviceName)
      cameraHelper?.openCamera()
    }

    override fun onCameraOpen(device: UsbDevice?) {
      if(DEBUG) Log.v(TAG,"onCameraOpen" + device?.deviceName)
      cameraHelper?.apply {
        startPreview()

        // Update aspect ratio based on the camera's actual output
        previewSize?.let { size ->
          post {
            cameraViewMain.setAspectRatio(size.width, size.height)
          }
        }

        addSurface(cameraViewMain.holder.surface, false)
      }

    }

    override fun onCameraClose(device: UsbDevice?) {
      if(DEBUG) Log.v(TAG,"onCameraClose" + device?.deviceName)
      cameraHelper?.removeSurface(cameraViewMain.holder.surface)
    }

    override fun onDeviceClose(device: UsbDevice?) {
      TODO("Not yet implemented")
    }

    override fun onDetach(device: UsbDevice?) {
      TODO("Not yet implemented")
    }

    override fun onCancel(device: UsbDevice?) {
      TODO("Not yet implemented")
    }
  }



}
