import { useEffect, useRef, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

import { Post } from "../types/post";
import PostCard from "../components/PostCard";
import ErrorState from "../components/ErrorState";
import Loading from "../components/Loading";
import { fetchPostsAPI } from "../services/api";

export default function PostsScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<"" | "offline" | "server" | "network">("");

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved search from AsyncStorage
  useEffect(() => {
    const loadSaved = async () => {
      const saved = await AsyncStorage.getItem("searchText");
      if (saved) setSearch(saved);
    };
    loadSaved();
  }, []);

  // Fetch posts
  const fetchPosts = async () => {
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
      const data = await fetchPostsAPI();

      setPosts(data);

      const initial = data.filter((post: Post) =>
        post.title.toLowerCase().includes(search.toLowerCase())
      );

      setFilteredPosts(initial);
      setError("");
    } catch (err: any) {
      if (err.response) {
        setError("server");
        Toast.show({
          type: "error",
          text1: "Server Error",
          text2: `Status ${err.response.status}`,
        });
      } else {
        setError("network");
        Toast.show({
          type: "error",
          text1: "Network Error",
          text2: "Something went wrong.",
        });
      }
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

      const filtered = posts.filter((post: Post) =>
        post.title.toLowerCase().includes(search.toLowerCase())
      );

      setFilteredPosts(filtered);
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search, posts]);

  // Pull-to-refresh
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

      {/* Loading UI */}
      {loading && !refreshing && <Loading />}

      {/* Error States */}
      {!loading && error !== "" && (
        <ErrorState type={error} onRetry={fetchPosts} />
      )}

      {/* Posts List */}
      {!loading && error === "" && (
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
          renderItem={({ item }) => <PostCard item={item} />}
        />
      )}
    </View>
  );
}
