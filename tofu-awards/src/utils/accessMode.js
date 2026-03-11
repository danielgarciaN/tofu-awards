const ACCESS_MODE_KEY = "tofu-awards-access-mode";

export const ACCESS_MODES = {
  STANDARD: "standard",
  PREMIUM: "premium",
};

export const getStoredAccessMode = () => {
  if (typeof window === "undefined") {
    return ACCESS_MODES.STANDARD;
  }

  return sessionStorage.getItem(ACCESS_MODE_KEY) || ACCESS_MODES.STANDARD;
};

export const setStoredAccessMode = (mode) => {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(ACCESS_MODE_KEY, mode);
};

export const clearStoredAccessMode = () => {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(ACCESS_MODE_KEY);
};

export const isPremiumAccess = (mode) => mode === ACCESS_MODES.PREMIUM;
