let storageMode = "mongo";

export function setStorageMode(mode) {
  storageMode = mode;
}

export function getStorageMode() {
  return storageMode;
}

export function isDevStore() {
  return storageMode === "dev-store";
}
