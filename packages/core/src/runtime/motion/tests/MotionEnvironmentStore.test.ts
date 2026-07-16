import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getMotionEnvironmentServerSnapshot,
  getMotionEnvironmentSnapshot,
  subscribeMotionEnvironment,
} from '../motion-environment-store';

type MediaListener = (event: MediaQueryListEvent) => void;
type ConnectionListener = (event: Event) => void;

function createPointerController(initial: boolean, legacy = false) {
  let matches = initial;
  const listeners = new Set<MediaListener>();
  const addEventListener = vi.fn((_type: string, listener: MediaListener) => {
    listeners.add(listener);
  });
  const removeEventListener = vi.fn((_type: string, listener: MediaListener) => {
    listeners.delete(listener);
  });
  const addListener = vi.fn((listener: MediaListener) => listeners.add(listener));
  const removeListener = vi.fn((listener: MediaListener) => listeners.delete(listener));

  const query = {
    get matches() {
      return matches;
    },
    media: '(pointer: coarse)',
    onchange: null,
    addEventListener: legacy ? undefined : addEventListener,
    removeEventListener: legacy ? undefined : removeEventListener,
    addListener,
    removeListener,
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;
  const matchMedia = vi.fn(() => query);

  return {
    addEventListener,
    addListener,
    listeners,
    matchMedia,
    removeEventListener,
    removeListener,
    emit(next: boolean) {
      matches = next;
      const event = { matches: next, media: query.media } as MediaQueryListEvent;
      [...listeners].forEach((listener) => listener(event));
    },
  };
}

function createConnectionController() {
  let effectiveType = '4g';
  let saveData = false;
  const listeners = new Set<ConnectionListener>();
  const addEventListener = vi.fn((_type: string, listener: ConnectionListener) => {
    listeners.add(listener);
  });
  const removeEventListener = vi.fn((_type: string, listener: ConnectionListener) => {
    listeners.delete(listener);
  });
  const connection = {
    get effectiveType() {
      return effectiveType;
    },
    get saveData() {
      return saveData;
    },
    addEventListener,
    removeEventListener,
  };

  return {
    addEventListener,
    connection,
    listeners,
    removeEventListener,
    emit(next: { effectiveType?: string; saveData?: boolean }) {
      if (next.effectiveType !== undefined) effectiveType = next.effectiveType;
      if (next.saveData !== undefined) saveData = next.saveData;
      const event = new Event('change');
      [...listeners].forEach((listener) => listener(event));
    },
  };
}

const activeUnsubscribers: Array<() => void> = [];
let originalMatchMedia: typeof window.matchMedia;
let originalConnection: PropertyDescriptor | undefined;
let originalVisibilityState: PropertyDescriptor | undefined;
let visibilityState: DocumentVisibilityState;

function trackSubscription(listener: () => void): () => void {
  const unsubscribe = subscribeMotionEnvironment(listener);
  activeUnsubscribers.push(unsubscribe);
  return unsubscribe;
}

function installConnection(connection: object): void {
  Object.defineProperty(navigator, 'connection', {
    configurable: true,
    value: connection,
  });
}

function setVisibility(next: DocumentVisibilityState): void {
  visibilityState = next;
  document.dispatchEvent(new Event('visibilitychange'));
}

beforeEach(() => {
  originalMatchMedia = window.matchMedia;
  originalConnection = Object.getOwnPropertyDescriptor(navigator, 'connection');
  originalVisibilityState = Object.getOwnPropertyDescriptor(document, 'visibilityState');
  visibilityState = 'visible';
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => visibilityState,
  });
});

afterEach(() => {
  activeUnsubscribers.splice(0).forEach((unsubscribe) => unsubscribe());
  window.matchMedia = originalMatchMedia;

  if (originalConnection) Object.defineProperty(navigator, 'connection', originalConnection);
  else Reflect.deleteProperty(navigator, 'connection');

  if (originalVisibilityState) {
    Object.defineProperty(document, 'visibilityState', originalVisibilityState);
  } else {
    Reflect.deleteProperty(document, 'visibilityState');
  }

  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('motion environment store', () => {
  it('uses an immutable, conservative snapshot for SSR and unavailable browser state', () => {
    const serverSnapshot = getMotionEnvironmentServerSnapshot();
    expect(serverSnapshot).toEqual({
      pointer: 'coarse',
      power: 'constrained',
      visible: false,
    });
    expect(Object.isFrozen(serverSnapshot)).toBe(true);

    vi.stubGlobal('window', undefined);
    expect(getMotionEnvironmentSnapshot()).toBe(serverSnapshot);
    vi.unstubAllGlobals();
  });

  it('shares one cached source set, ref-counts duplicate consumers, and publishes live changes', () => {
    const pointer = createPointerController(false);
    const network = createConnectionController();
    window.matchMedia = pointer.matchMedia as typeof window.matchMedia;
    installConnection(network.connection);
    const addDocumentListener = vi.spyOn(document, 'addEventListener');
    const removeDocumentListener = vi.spyOn(document, 'removeEventListener');

    // useSyncExternalStore may read once per consumer before subscribing.
    Array.from({ length: 40 }, () => getMotionEnvironmentSnapshot());
    expect(pointer.matchMedia).toHaveBeenCalledTimes(1);

    const duplicateConsumer = vi.fn();
    const otherConsumers = Array.from({ length: 20 }, () => vi.fn());
    const unsubscribeDuplicateA = trackSubscription(duplicateConsumer);
    const unsubscribeDuplicateB = trackSubscription(duplicateConsumer);
    const unsubscribeOthers = otherConsumers.map(trackSubscription);

    expect(pointer.matchMedia).toHaveBeenCalledTimes(1);
    expect(pointer.addEventListener).toHaveBeenCalledTimes(1);
    expect(pointer.listeners.size).toBe(1);
    expect(network.addEventListener).toHaveBeenCalledTimes(1);
    expect(network.listeners.size).toBe(1);
    expect(
      addDocumentListener.mock.calls.filter(([type]) => type === 'visibilitychange'),
    ).toHaveLength(1);
    expect(getMotionEnvironmentSnapshot()).toEqual({
      pointer: 'fine',
      power: 'normal',
      visible: true,
    });

    pointer.emit(true);
    expect(duplicateConsumer).toHaveBeenCalledTimes(1);
    expect(otherConsumers.every((consumer) => consumer.mock.calls.length === 1)).toBe(true);
    expect(getMotionEnvironmentSnapshot().pointer).toBe('coarse');

    // An event that does not alter the semantic snapshot must not fan out.
    pointer.emit(true);
    expect(duplicateConsumer).toHaveBeenCalledTimes(1);

    network.emit({ effectiveType: '2g' });
    expect(getMotionEnvironmentSnapshot().power).toBe('constrained');
    expect(duplicateConsumer).toHaveBeenCalledTimes(2);

    network.emit({ effectiveType: '4g' });
    expect(getMotionEnvironmentSnapshot().power).toBe('normal');
    expect(duplicateConsumer).toHaveBeenCalledTimes(3);

    network.emit({ saveData: true });
    expect(getMotionEnvironmentSnapshot().power).toBe('constrained');
    expect(duplicateConsumer).toHaveBeenCalledTimes(4);

    setVisibility('hidden');
    expect(getMotionEnvironmentSnapshot().visible).toBe(false);
    expect(duplicateConsumer).toHaveBeenCalledTimes(5);

    // One unsubscribe cannot remove a duplicated callback's remaining lease.
    unsubscribeDuplicateA();
    unsubscribeDuplicateA();
    pointer.emit(false);
    expect(duplicateConsumer).toHaveBeenCalledTimes(6);

    unsubscribeDuplicateB();
    unsubscribeOthers.forEach((unsubscribe) => unsubscribe());
    expect(pointer.removeEventListener).toHaveBeenCalledTimes(1);
    expect(pointer.listeners.size).toBe(0);
    expect(network.removeEventListener).toHaveBeenCalledTimes(1);
    expect(network.listeners.size).toBe(0);
    expect(
      removeDocumentListener.mock.calls.filter(([type]) => type === 'visibilitychange'),
    ).toHaveLength(1);

    pointer.emit(true);
    network.emit({ saveData: false });
    setVisibility('visible');
    expect(duplicateConsumer).toHaveBeenCalledTimes(6);
  });

  it('fully detaches the old realm and creates one fresh source set on resubscribe', () => {
    const firstPointer = createPointerController(false);
    const firstNetwork = createConnectionController();
    window.matchMedia = firstPointer.matchMedia as typeof window.matchMedia;
    installConnection(firstNetwork.connection);

    const firstConsumer = vi.fn();
    const unsubscribeFirst = trackSubscription(firstConsumer);
    unsubscribeFirst();

    const secondPointer = createPointerController(true);
    const secondNetwork = createConnectionController();
    window.matchMedia = secondPointer.matchMedia as typeof window.matchMedia;
    installConnection(secondNetwork.connection);

    const secondConsumer = vi.fn();
    const unsubscribeSecond = trackSubscription(secondConsumer);
    expect(firstPointer.matchMedia).toHaveBeenCalledTimes(1);
    expect(firstPointer.listeners.size).toBe(0);
    expect(firstNetwork.listeners.size).toBe(0);
    expect(secondPointer.matchMedia).toHaveBeenCalledTimes(1);
    expect(secondPointer.listeners.size).toBe(1);
    expect(secondNetwork.listeners.size).toBe(1);
    expect(getMotionEnvironmentSnapshot().pointer).toBe('coarse');

    firstPointer.emit(true);
    firstNetwork.emit({ effectiveType: '2g' });
    expect(firstConsumer).not.toHaveBeenCalled();
    expect(secondConsumer).not.toHaveBeenCalled();

    secondPointer.emit(false);
    expect(secondConsumer).toHaveBeenCalledTimes(1);
    unsubscribeSecond();
    expect(secondPointer.removeEventListener).toHaveBeenCalledTimes(1);
    expect(secondNetwork.removeEventListener).toHaveBeenCalledTimes(1);
  });

  it('uses the legacy Safari MediaQueryList API and removes its listener', () => {
    const pointer = createPointerController(false, true);
    const network = createConnectionController();
    window.matchMedia = pointer.matchMedia as typeof window.matchMedia;
    installConnection(network.connection);
    const consumer = vi.fn();

    const unsubscribe = trackSubscription(consumer);
    expect(pointer.addEventListener).not.toHaveBeenCalled();
    expect(pointer.addListener).toHaveBeenCalledTimes(1);
    expect(pointer.listeners.size).toBe(1);

    pointer.emit(true);
    expect(getMotionEnvironmentSnapshot().pointer).toBe('coarse');
    expect(consumer).toHaveBeenCalledTimes(1);

    unsubscribe();
    expect(pointer.removeListener).toHaveBeenCalledTimes(1);
    expect(pointer.listeners.size).toBe(0);
  });
});
