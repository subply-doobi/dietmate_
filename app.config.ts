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
        },
      },
    ],
    [
      "@react-native-kakao/core",
      {
        nativeAppKey: "5065665acbfa07f0dd876a374e66e618",
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
  },
});
