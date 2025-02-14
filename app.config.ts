import { ConfigContext, ExpoConfig } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return "com.subply.dietmate.dev";
  }

  if (IS_PREVIEW) {
    return "com.subply.dietmate.preview";
  }

  return "com.subply.dietmate";
};

const getAppName = () => {
  if (IS_DEV) {
    return "근의공식 (Dev)";
  }

  if (IS_PREVIEW) {
    return "근의공식 (Prv)";
  }

  return "근의공식";
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: getAppName(),
  owner: "subply",
  slug: "dietmate",
  version: "1.1.2",
  orientation: "portrait",
  icon: "./shared/assets/appIcon/appIcon.png",
  scheme: "dietmate",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  updates: {
    url: "https://u.expo.dev/3961e206-831a-4f33-b8a6-f72e46a5aab0",
  },
  runtimeVersion: "1.1.0",
  ios: {
    supportsTablet: true,
    usesAppleSignIn: true,
    bundleIdentifier: getUniqueIdentifier(),
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: getUniqueIdentifier(),
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./shared/assets/appIcon/appIcon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#ffffff",
        image: "./assets/images/splash-icon.png",
        imageWidth: 80,
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          extraMavenRepos: [
            "https://devrepo.kakao.com/nexus/content/groups/public/",
          ],
          usesCleartextTraffic: true,
        },
        ios: {
          infoPlist: {
            NSAppTransportSecurity: { NSAllowsArbitraryLoads: true },
          },
        },
      },
    ],
    [
      "@react-native-kakao/core",
      {
        nativeAppKey: process.env.KAKAO_NATIVE_APP_KEY,
        android: {
          authCodeHandlerActivity: true,
        },
        ios: {
          handleKakaoOpenUrl: true,
        },
      },
    ],
    ["@portone/react-native-sdk/plugin"],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "3961e206-831a-4f33-b8a6-f72e46a5aab0",
    },
    API_KEY_IAMPORT: process.env.API_KEY_IAMPORT,
    API_SECRET_IAMPORT: process.env.API_SECRET_IAMPORT,
    CHANNEL_KEY_KAKAOPAY: process.env.CHANNEL_KEY_KAKAOPAY,
    CHANNEL_KEY_SMARTRO_V2: process.env.CHANNEL_KEY_SMARTRO_V2,
    EXPO_PUBLIC_APP_SCHEME_IAMPORT: process.env.EXPO_PUBLIC_APP_SCHEME_IAMPORT,
    EXPO_PUBLIC_AXIOS_TIMEOUT: process.env.EXPO_PUBLIC_AXIOS_TIMEOUT,
    EXPO_PUBLIC_BASE_URL: process.env.EXPO_PUBLIC_BASE_URL,
    EXPO_PUBLIC_REDIRECT_URL_IAMPORT:
      process.env.EXPO_PUBLIC_REDIRECT_URL_IAMPORT,
    EXPO_PUBLIC_STORE_ID_IAMPORT: process.env.EXPO_PUBLIC_STORE_ID_IAMPORT,
  },
});
