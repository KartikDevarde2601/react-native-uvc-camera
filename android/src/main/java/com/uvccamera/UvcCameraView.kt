package com.uvccamera

import android.content.Context
import android.graphics.SurfaceTexture
import android.hardware.usb.UsbDevice
import android.util.AttributeSet
import android.util.Log
import android.view.Gravity
import android.view.TextureView
import android.widget.FrameLayout
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.herohan.uvcapp.CameraHelper
import com.herohan.uvcapp.ICameraHelper
import com.herohan.uvcapp.IImageCapture
import com.herohan.uvcapp.IImageCapture.OnImageCaptureCallback
import com.serenegiant.usb.Size
import com.serenegiant.widget.AspectRatioTextureView
import com.uvccamera.utils.SaveHelper
import java.io.File

class UvcCameraView @JvmOverloads constructor(
  context: Context,
  attrs: AttributeSet? = null
) : FrameLayout(context, attrs) {

  private val DEFAULT_WIDTH: Int = 640
  private val DEFAULT_HEIGHT: Int = 480
  private lateinit var cameraViewMain: AspectRatioTextureView
  private var cameraHelper: ICameraHelper? = null
  private val DEBUG: Boolean = true
  private var mPreviewWidth = DEFAULT_WIDTH
  private var mPreviewHeight = DEFAULT_HEIGHT

  companion object {
    private const val TAG = "UvcCameraView"
  }

  init {
    setupView()
  }

  private fun setupView() {
    // 1. Use AspectRatioTextureView (Fixes Z-Index/Button Click issues)
    cameraViewMain = AspectRatioTextureView(context).apply {
      setAspectRatio(mPreviewWidth, mPreviewHeight)
    }

    val params = LayoutParams(
      LayoutParams.MATCH_PARENT,
      LayoutParams.MATCH_PARENT
    )
    params.gravity = Gravity.CENTER
    addView(cameraViewMain, params)

    cameraViewMain.surfaceTextureListener = object : TextureView.SurfaceTextureListener {
      override fun onSurfaceTextureAvailable(surface: SurfaceTexture, width: Int, height: Int) {
        cameraHelper?.addSurface(surface, false)
      }

      override fun onSurfaceTextureSizeChanged(surface: SurfaceTexture, width: Int, height: Int) {}

      override fun onSurfaceTextureDestroyed(surface: SurfaceTexture): Boolean {
        cameraHelper?.removeSurface(surface)
        return true
      }

      override fun onSurfaceTextureUpdated(surface: SurfaceTexture) {}
    }
  }

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

    // Pick first device automatically
    val deviceList = cameraHelper?.deviceList
    deviceList?.firstOrNull()?.let { device ->
      if (DEBUG) Log.d(TAG, "Found device: ${device.deviceName}")
      cameraHelper?.selectDevice(device)
    }
  }

  private val stateListener = object : ICameraHelper.StateCallback {
    override fun onAttach(device: UsbDevice?) {
      device?.let { cameraHelper?.selectDevice(it) }
    }

    override fun onDeviceOpen(device: UsbDevice?, isFirstOpen: Boolean) {
      cameraHelper?.openCamera()
    }

    override fun onCameraOpen(device: UsbDevice?) {
      cameraHelper?.apply {
        startPreview()

        // Resize Logic
        previewSize?.let { size -> resizePreviewView(size) }

        // Attach Surface
        cameraViewMain.surfaceTexture?.let { texture -> addSurface(texture, false) }
      }
    }

    override fun onCameraClose(device: UsbDevice?) {
      cameraViewMain.surfaceTexture?.let { texture -> cameraHelper?.removeSurface(texture) }
    }

    override fun onDeviceClose(device: UsbDevice?) {}
    override fun onDetach(device: UsbDevice?) {}
    override fun onCancel(device: UsbDevice?) {}
  }

  private fun resizePreviewView(size: Size) {
    post {
      mPreviewWidth = size.width
      mPreviewHeight = size.height
      cameraViewMain.setAspectRatio(mPreviewWidth, mPreviewHeight)
      cameraViewMain.requestLayout() // Fixes "Squashed" video
    }
  }

  // --- EVENT SENDING (Fabric Compatible) ---
  private fun sendEvent(uri: String) {
    val reactContext = context as ReactContext
    val dispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)
    val surfaceId = UIManagerHelper.getSurfaceId(reactContext)

    if (dispatcher != null) {
      // Requires PictureTakenEvent.kt to exist
      dispatcher.dispatchEvent(
        PictureTakenEvent(surfaceId, id, uri)
      )
    }
  }

  fun takePicture() {
    if (cameraHelper == null || cameraHelper?.isCameraOpened != true) {
      Log.e(TAG, "Camera is not open")
      return
    }

    try {
      // Fixes Permission Error by using App Specific Storage
      val path = SaveHelper.getSavePhotoPath(context)
      val file = File(path)
      val options = IImageCapture.OutputFileOptions.Builder(file).build()

      cameraHelper?.takePicture(options, object : OnImageCaptureCallback {
        override fun onImageSaved(outputFileResults: IImageCapture.OutputFileResults) {
          if (DEBUG) Log.d(TAG, "Saved: ${file.absolutePath}")
          val uri = "file://" + file.absolutePath
          sendEvent(uri)
        }

        override fun onError(imageCaptureError: Int, message: String, cause: Throwable?) {
          Log.e(TAG, "Capture Error: $message")
        }
      })
    } catch (e: Exception) {
      Log.e(TAG, "File Error: ${e.message}")
    }
  }
}
