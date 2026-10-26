const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || "https://api.anushatechnologies.com/api",
);

export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

export const SHARE_URL = trimTrailingSlash(
  import.meta.env.VITE_SHARE_URL || "https://anushabazaar.com",
);

export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const HAS_FIREBASE_CONFIG = Boolean(
  FIREBASE_CONFIG.apiKey &&
  FIREBASE_CONFIG.authDomain &&
  FIREBASE_CONFIG.projectId &&
  FIREBASE_CONFIG.appId,
);

export const APP_COPY = {
  brand: "Anusha Bazaar",
  tagLine: "Fresh groceries, trusted quality, and doorstep convenience.",
  phonePrimary: "+91 85229 18866",
  supportEmail: "support@anushabazaar.com",
  backupEmail: "anushabazaar4@gmail.com",
  headquarters: "Laxminagar Colony, Vivekananda Nagar Extension, Kukatpally, Hyderabad, Telangana 500072",
  defaultCity: "Hyderabad",
  defaultState: "Telangana",
};
