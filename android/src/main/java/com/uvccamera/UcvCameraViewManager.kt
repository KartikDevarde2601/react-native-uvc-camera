package com.uvccamera

import android.graphics.Color
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.UvcCameraViewManagerInterface
import com.facebook.react.viewmanagers.UvcCameraViewManagerDelegate

@ReactModule(name = UvcCameraViewManager.NAME)
class UvcCameraViewManager : SimpleViewManager<UvcCameraView>(),
  UvcCameraViewManagerInterface<UvcCameraView> {
  private val mDelegate: ViewManagerDelegate<UvcCameraView>

  init {
    mDelegate = UvcCameraViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<UvcCameraView>? {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): UvcCameraView {
    return UvcCameraView(context)
  }

  @ReactProp(name = "color")
  override fun setColor(view: UvcCameraView?, color: String?) {
    view?.setBackgroundColor(Color.parseColor(color))
  }

  companion object {
    const val NAME = "UvcCameraView"
  }
}
