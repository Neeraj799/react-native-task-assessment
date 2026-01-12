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

export default function PostsScreen() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const debounceTimer = useRef(null);

  // Load saved search from AsyncStorage
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const saved = await AsyncStorage.getItem("searchText");
        if (saved) setSearch(saved);
      } catch {}
    };
    loadSaved();
  }, []);

  // Fetch posts (with offline detection)
  const fetchPosts = async () => {
    setError("");

    if (!refreshing) setLoading(true);

    // Check Internet Before Fetching
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

    // Make API Call
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

      const data = await response.json();
      setPosts(data);

      setError("");

      const initial = data.filter((post) =>
        post.title.toLowerCase().includes(search.toLowerCase())
      );

      setFilteredPosts(initial);
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

  // Debounced Search and Save to AsyncStorage
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      await AsyncStorage.setItem("searchText", search);

      const filtered = posts.filter((post) =>
        post.title.toLowerCase().includes(search.toLowerCase())
      );

      setFilteredPosts(filtered);
    }, 300);

    return () => clearTimeout(debounceTimer.current);
  }, [search, posts]);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
  };

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4 text-black">Posts</Text>

      {/* Search Box */}
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

      {/* OFFLINE UI */}
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

      {/* SERVER ERROR UI */}
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

      {/* NETWORK ERROR UI */}
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

      {/* POSTS LIST */}
      {!loading && !error && (
        <FlatList
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
