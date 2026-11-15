// Device-only storage (localStorage). Nothing here is ever sent to the server as a whole:
// only the specific needs/contact a person chooses for one request leave the device.
// Every access is wrapped in try/catch: storage can be blocked (private mode, settings).
// Import only from client components ("use client").
import { useEffect, useState } from "react";

const KEYS = {
  profile: "accessly.profile",
  myRequests: "accessly.myRequests",
  myEvents: "accessly.myEvents",
};

// Fired on the window whenever this tab changes stored data, so other components can refresh.
export const LOCAL_CHANGE_EVENT = "accessly:local-change";

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(LOCAL_CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export const DEFAULT_PROFILE = {
  avatar: "",
  username: "",
  pronouns: "",
  anonymousByDefault: true,
  canContact: false,
  contact: "",
  notes: "",
  needs: [],
};

export function getProfile() {
  return { ...DEFAULT_PROFILE, ...read(KEYS.profile, {}) };
}
export function saveProfile(profile) {
  return write(KEYS.profile, profile);
}

/** [{ token, eventId, eventName, needs, createdAt }] newest first. */
export function getMyRequests() {
  const list = read(KEYS.myRequests, []);
  return Array.isArray(list) ? list : [];
}
export function addMyRequest(entry) {
  const list = getMyRequests().filter((r) => r.token !== entry.token);
  return write(KEYS.myRequests, [{ ...entry, createdAt: new Date().toISOString() }, ...list]);
}
export function removeMyRequest(token) {
  return write(KEYS.myRequests, getMyRequests().filter((r) => r.token !== token));
}

/** [{ eventId, organizerKey, name }] — events this device created (used by the Organizer tab). */
export function getMyEvents() {
  const list = read(KEYS.myEvents, []);
  return Array.isArray(list) ? list : [];
}
export function saveMyEvents(list) {
  return write(KEYS.myEvents, list);
}

/** "Clear all my data": removes everything Accessly stored on this device. */
export function clearAll() {
  try {
    Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
    window.dispatchEvent(new Event(LOCAL_CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

/** True if localStorage works here (it can be disabled). */
export function storageAvailable() {
  try {
    const k = "accessly.__test";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

/**
 * React hook: reads a value from device storage after mount (so server and first client
 * render match) and re-reads whenever stored data changes (this tab or another tab).
 * Returns `fallback` until loaded; `loaded` tells you whether it has read storage yet.
 */
export function useLocal(getter, fallback) {
  const [state, setState] = useState({ value: fallback, loaded: false });
  useEffect(() => {
    const update = () => setState({ value: getter(), loaded: true });
    update();
    window.addEventListener(LOCAL_CHANGE_EVENT, update);
    window.addEventListener("storage", update); // other tabs
    return () => {
      window.removeEventListener(LOCAL_CHANGE_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, [getter]);
  return [state.value, state.loaded];
}
