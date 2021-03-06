function TapDetector () {
  
    let singleTapCallbacks = []
    let doubleTapCallbacks = []
  
    function triggerCallbacks (cbList, arg) {
      cbList.forEach(cbItem => {
        cbItem.call(null, arg)
      })
    }
  
    this.onSingleTap = function (cb) {
      if (typeof cb === 'function' && !singleTapCallbacks.includes(cb)) {
        singleTapCallbacks.push(cb)
      }
    }
    this.onDoubleTap = function (cb) {
      if (typeof cb === 'function' && !doubleTapCallbacks.includes(cb)) {
        doubleTapCallbacks.push(cb)
      }
    }
  
    this.attach = function (dom) {
      if (!(dom instanceof Element)) {
        // console.error('TapDetector.attach: arg must be an Element')
        return
      }
      dom.addEventListener('touchstart', onTouchStart)
      dom.addEventListener('touchmove', onTouchMove)
      dom.addEventListener('touchend', onTouchEnd)
      dom.addEventListener('mousedown', onMouseDown)
      dom.addEventListener('mouseup', onMouseUp)
      dom.addEventListener('mousemove', onMouseMove)
    }
  
    this.detach = function (dom) {
      dom.removeEventListener('touchstart', onTouchStart)
      dom.removeEventListener('touchmove', onTouchMove)
      dom.removeEventListener('touchend', onTouchEnd)
      dom.removeEventListener('mousedown', onMouseDown)
      dom.removeEventListener('mouseup', onMouseUp)
      dom.removeEventListener('mousemove', onMouseMove)
    }
  
    // Main logic ----------------------------------------------------------------
  
    // in touch mode mouse events will be disabled. Otherwise touches will
    // trigger both touchend end mouseup, i.e. one touch triggers two onPointerUp.
    let isTouchMode = false
    let lastTapTimestamp = 0
    let tappedCount = 0
    let touchMovedLength = 0
    let lastPointerX = 0
    let lastPointerY = 0
  
    function onTouchStart (ev) {
      isTouchMode = true
      if (ev.touches.length === 1) {
        onPointerDown(ev.touches[0].clientX, ev.touches[0].clientY)
      }
    }
    function onTouchEnd (ev) {
      if (ev.touches.length === 0) {
        onPointerUp()
      }
    }
    function onTouchMove (ev) {
      if (ev.touches.length === 1) {
        onPointerMove(ev.touches[0].clientX, ev.touches[0].clientY)
      }
    }
  
    function onMouseDown (ev) {
      if (isTouchMode) return
  
      onPointerDown(ev.clientX, ev.clientY)
    }
    function onMouseUp () {
      if (isTouchMode) return

      onPointerUp()
    }
    function onMouseMove (ev) {
      if (isTouchMode) return
  
      if (ev.button === 0) {
        onPointerMove(ev.clientX, ev.clientY)
      }
    }
  
    function onPointerDown (x, y) {
      lastPointerX = x
      lastPointerY = y
      touchMovedLength = 0
    }
    function onPointerUp () {
      let currTimeStamp = Date.now()
      if (touchMovedLength < 10) {
        // Only when no sliding two far is considered as a valid tap
        if (currTimeStamp - lastTapTimestamp < 300) {
          tappedCount += 1
        } else {
          tappedCount = 1
        }
        lastTapTimestamp = Date.now()
        triggerCallbacks(singleTapCallbacks, {
          clientX: lastPointerX,
          clientY: lastPointerY,
        })
        if (tappedCount === 2) {
          triggerCallbacks(doubleTapCallbacks, {
            clientX: lastPointerX,
            clientY: lastPointerY,
          })
          tappedCount = 0 // clear count on maximum tap count
        }
      }
      touchMovedLength = 0
    }
    function onPointerMove (x, y) {
      let deltaX = lastPointerX - x
      let deltaY = lastPointerY - y
      let length = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      touchMovedLength += length
      lastPointerX = x
      lastPointerY = y
    }
  }
  
  export default TapDetector