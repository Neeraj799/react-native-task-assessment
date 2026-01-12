import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export default function PostsScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<"" | "offline" | "server" | "network">("");

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved search
  useEffect(() => {
    const loadSaved = async () => {
      const saved = await AsyncStorage.getItem("searchText");
      if (saved) setSearch(saved);
    };
    loadSaved();
  }, []);

  const fetchPosts = async (): Promise<void> => {
    setError("");

    if (!refreshing) setLoading(true);

    // Check Internet
    const net = await NetInfo.fetch();
    if (!net.isConnected) {
      setLoading(false);
      setRefreshing(false);
      setError("offline");

      Toast.show({
        type: "error",
        text1: "No Internet",
        text2: "You are offline.",
      });
      return;
    }

    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts"
      );

      if (!response.ok) {
        setError("server");
        Toast.show({
          type: "error",
          text1: "Server Error",
          text2: `Status ${response.status}`,
        });
        return;
      }

      const data: Post[] = await response.json();
      setPosts(data);

      const initial = data.filter((post) =>
        post.title.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredPosts(initial);

      setError("");
    } catch (err) {
      setError("network");
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Something went wrong.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      await AsyncStorage.setItem("searchText", search);

      const filtered = posts.filter((post) =>
        post.title.toLowerCase().includes(search.toLowerCase())
      );

      setFilteredPosts(filtered);
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search, posts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
  };

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4 text-black">Posts</Text>

      {/* Search */}
      <TextInput
        placeholder="Search posts..."
        value={search}
        onChangeText={setSearch}
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-black"
        placeholderTextColor="#666"
      />

      {/* Loading */}
      {loading && !refreshing && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}

      {/* Errors */}
      {!loading && error === "offline" && (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-700 mb-3">You are offline.</Text>
          <TouchableOpacity
            onPress={fetchPosts}
            className="bg-blue-600 px-5 py-3 rounded-xl"
          >
            <Text className="text-white text-lg">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && error === "server" && (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-red-600 mb-3">
            Server error. Try again later.
          </Text>
          <TouchableOpacity
            onPress={fetchPosts}
            className="bg-blue-600 px-5 py-3 rounded-xl"
          >
            <Text className="text-white text-lg">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && error === "network" && (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-red-600 mb-3">
            Something went wrong.
          </Text>
          <TouchableOpacity
            onPress={fetchPosts}
            className="bg-blue-600 px-5 py-3 rounded-xl"
          >
            <Text className="text-white text-lg">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Posts List */}
      {!loading && !error && (
        <FlatList<Post>
          data={filteredPosts}
          keyExtractor={(item) => item.id.toString()}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <Text className="text-center text-gray-600 mt-10">
              No posts found.
            </Text>
          }
          renderItem={({ item }) => (
            <View className="bg-gray-100 p-4 rounded-xl mb-3">
              <Text className="text-lg font-semibold text-black">
                {item.title}
              </Text>
              <Text className="text-gray-800 mt-1">{item.body}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
