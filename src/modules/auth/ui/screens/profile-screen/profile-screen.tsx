import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, MonoLabel } from "@/shared/ui";
import { useProfileScreenViewModel } from "./profile-screen.viewmodel";
import { useProfileScreenStyles } from "./profile-screen.styles";

export function ProfileScreen() {
  const { name, email, goBack } = useProfileScreenViewModel();
  const styles = useProfileScreenStyles();

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <Pressable onPress={goBack} hitSlop={12} style={styles.cancelRow}>
        <MonoLabel tone="faint">FECHAR</MonoLabel>
      </Pressable>

      <View style={styles.content}>
        <AppText variant="title">Perfil</AppText>

        <View style={styles.userInfo}>
          <AppText variant="bodyMedium">{name}</AppText>
          <AppText variant="body" tone="muted">
            {email}
          </AppText>
        </View>
      </View>
    </SafeAreaView>
  );
}
