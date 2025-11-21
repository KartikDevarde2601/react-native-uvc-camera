package com.uvccamera

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.viewmanagers.UvcCameraViewManagerInterface
import com.facebook.react.viewmanagers.UvcCameraViewManagerDelegate

@ReactModule(name = UvcCameraViewManager.NAME)
class UvcCameraViewManager : SimpleViewManager<UvcCameraView>(),
  UvcCameraViewManagerInterface<UvcCameraView> {

  private val mDelegate: ViewManagerDelegate<UvcCameraView>

  init {
    mDelegate = UvcCameraViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<UvcCameraView> {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  override fun createViewInstance(context: ThemedReactContext): UvcCameraView {
    return UvcCameraView(context)
  }

  // 1. Register the Event for JS ("onPictureTaken")
  override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any>? {
    return MapBuilder.of(
      "onPictureTaken",
      MapBuilder.of("registrationName", "onPictureTaken")
    )
  }

  // 2. Handle Commands (New Architecture)
  override fun receiveCommand(root: UvcCameraView, commandId: String, args: ReadableArray?) {
    when (commandId) {
      "takePicture" -> root.takePicture()
      else -> super.receiveCommand(root, commandId, args)
    }
  }

  // Required by Interface (Codegen)
  override  fun takePicture(view: UvcCameraView?) {
    view?.takePicture()
  }

  companion object {
    const val NAME = "UvcCameraView"
  }
}
