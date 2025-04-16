// Type definitions for iOS-specific DeviceMotionEvent
interface DeviceMotionEventStatic extends EventTarget {
  new(type: string, eventInitDict?: DeviceMotionEventInit): DeviceMotionEvent;
  requestPermission?(): Promise<'granted' | 'denied'>;
}

declare global {
  interface Window {
    DeviceMotionEvent: DeviceMotionEventStatic;
  }
}

export {}; 