import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.telstp.aicompanion",
  appName: "AI Companion",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#059669",
      showSpinner: false,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#059669",
    },
    BackgroundMode: {
      enabled: true,
      title: "AI Companion Active",
      text: "Your AI companion is running in the background",
    },
  },
}

export default config
