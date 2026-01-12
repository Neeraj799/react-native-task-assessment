import { Text, TextInput, View } from "react-native";
import PostScreens from "./screens/PostsScreen";

export default function Index() {
  return (
    <View className="flex-1 bg-white p-4">
      <PostScreens />
    </View>
  );
}
