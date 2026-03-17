import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { themeStore } from '@/store/themeStore';
import { blogBookmarkStore, BookmarkedBlogItem } from '@/store/blogBookmarkStore';
import { darkColors, lightColors } from '@/themes/color';
import { useShallow } from 'zustand/react/shallow';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function BookmarkedBlogsScreen() {
  const { theme } = themeStore(useShallow((state) => ({ theme: state.theme })));
  const ids = blogBookmarkStore((state) => state.ids);
  const postsMap = blogBookmarkStore((state) => state.posts);
  const removeBookmark = blogBookmarkStore((state) => state.removeBookmark);
  const posts = ids.map((id) => postsMap[id]).filter(Boolean) as BookmarkedBlogItem[];
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const renderItem = ({ item }: { item: BookmarkedBlogItem }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={styles.cardTouch}
        onPress={() => router.push(`/blog/${item.id}`)}
        activeOpacity={0.75}
      >
        {item.featuredImage ? (
          <Image
            source={{ uri: item.featuredImage }}
            style={[styles.featuredImage, { backgroundColor: colors.border }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: colors.primary + '22' }]}>
            <Text style={[styles.placeholderIcon, { color: colors.primary }]}>📄</Text>
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          {item.excerpt ? (
            <Text style={[styles.excerpt, { color: colors.subText }]} numberOfLines={2}>
              {item.excerpt}
            </Text>
          ) : null}
          <Text style={[styles.date, { color: colors.subText }]}>
            {item.publishedAt ? formatDate(item.publishedAt) : 'Draft'}
          </Text>
          <Text style={[styles.cta, { color: colors.primary }]}>Read more →</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.removeBookmark, { backgroundColor: colors.background }]}
        onPress={() => removeBookmark(item.id)}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <MaterialIcons name="bookmark" size={22} color={colors.primary} />
        <Text style={[styles.removeBookmarkText, { color: colors.subText }]}>
          Remove
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Bookmarked blogs',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['bottom']}
      >
        {posts.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card }]}>
            <MaterialIcons name="bookmark-border" size={56} color={colors.subText} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No bookmarked blogs
            </Text>
            <Text style={[styles.emptyText, { color: colors.subText }]}>
              Bookmark posts from the Blog to see them here.
            </Text>
            <TouchableOpacity
              style={[styles.browseBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/blog')}
            >
              <Text style={styles.browseBtnText}>Browse blog</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardTouch: {
    flex: 1,
  },
  featuredImage: {
    width: '100%',
    height: 160,
  },
  placeholderImage: {
    width: '100%',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  excerpt: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    marginBottom: 8,
  },
  cta: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeBookmark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  removeBookmarkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  empty: {
    flex: 1,
    margin: 16,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  browseBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
