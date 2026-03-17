import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { themeStore } from '@/store/themeStore';
import { authStore } from '@/store/authStore';
import { blogBookmarkStore } from '@/store/blogBookmarkStore';
import { darkColors, lightColors } from '@/themes/color';
import { useShallow } from 'zustand/react/shallow';
import api from '@/lib/axios';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: string | null;
  updatedAt: string;
  metaTitle: string | null;
  metaDescription: string | null;
}

interface CommentReply {
  id: string;
  commentId: string;
  userId: string;
  content: string;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
}

interface CommentWithReplies {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
  replies: CommentReply[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function displayName(comment: { userName: string | null; userEmail: string | null }): string {
  if (comment.userName?.trim()) return comment.userName;
  if (comment.userEmail) return comment.userEmail.split('@')[0];
  return 'Anonymous';
}

export default function BlogPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = themeStore(useShallow((state) => ({ theme: state.theme })));
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const { isBookmarked, addBookmark, removeBookmark } = blogBookmarkStore();
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;
  const bookmarked = id ? isBookmarked(id) : false;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [replyTextByCommentId, setReplyTextByCommentId] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);

  const fetchPost = useCallback(() => {
    if (!id) return;
    api
      .get<BlogPost>(`/blog/posts/${id}`)
      .then((res) => {
        setPost(res.data);
        setError(null);
      })
      .catch(() => {
        setPost(null);
        setError('Could not load post.');
      });
  }, [id]);

  const fetchComments = useCallback(() => {
    if (!id) return;
    api
      .get<CommentWithReplies[]>(`/blog/posts/${id}/comments`)
      .then((res) => setComments(res.data ?? []))
      .catch(() => setComments([]));
  }, [id]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      api.get<BlogPost>(`/blog/posts/${id}`).then((r) => r.data),
      api.get<CommentWithReplies[]>(`/blog/posts/${id}/comments`).then((r) => r.data ?? []),
    ])
      .then(([p, c]) => {
        setPost(p);
        setComments(c);
        setError(null);
      })
      .catch(() => {
        setPost(null);
        setComments([]);
        setError('Could not load post.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const submitComment = () => {
    if (!id || !commentText.trim() || !isAuthenticated || submittingComment) return;
    setSubmittingComment(true);
    api
      .post(`/blog/posts/${id}/comments`, { content: commentText.trim() })
      .then(() => {
        setCommentText('');
        fetchComments();
      })
      .catch(() => {})
      .finally(() => setSubmittingComment(false));
  };

  const submitReply = (commentId: string) => {
    const text = replyTextByCommentId[commentId]?.trim();
    if (!text || submittingReplyId) return;
    setSubmittingReplyId(commentId);
    api
      .post(`/blog/comments/${commentId}/replies`, { content: text })
      .then(() => {
        setReplyTextByCommentId((prev) => ({ ...prev, [commentId]: '' }));
        fetchComments();
      })
      .catch(() => {})
      .finally(() => setSubmittingReplyId(null));
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Blog', headerBackTitle: 'Back' }} />
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        </SafeAreaView>
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Blog', headerBackTitle: 'Back' }} />
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
          <View style={[styles.empty, { backgroundColor: colors.card }]}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={[styles.emptyText, { color: colors.subText }]}>{error ?? 'Post not found'}</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const toggleBookmark = () => {
    if (!post) return;
    const item = {
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
    };
    if (bookmarked) removeBookmark(post.id);
    else addBookmark(item);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: post.title.length > 28 ? post.title.slice(0, 25) + '...' : post.title,
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity
              onPress={toggleBookmark}
              style={styles.headerBookmark}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialIcons
                name={bookmarked ? 'bookmark' : 'bookmark-border'}
                size={24}
                color={bookmarked ? colors.primary : colors.text}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {post.featuredImage ? (
            <Image
              source={{ uri: post.featuredImage }}
              style={[styles.featuredImage, { backgroundColor: colors.border }]}
              resizeMode="cover"
            />
          ) : null}
          <View style={styles.body}>
            <Text style={[styles.publishedDate, { color: colors.subText }]}>
              {post.publishedAt ? formatDate(post.publishedAt) : ''}
              {post.updatedAt && post.publishedAt && post.updatedAt !== post.publishedAt
                ? ` · Updated ${formatDate(post.updatedAt)}`
                : ''}
            </Text>
            <Text style={[styles.content, { color: colors.text }]}>{post.content}</Text>
          </View>

          <View style={[styles.commentsSection, { borderTopColor: colors.border }]}>
            <Text style={[styles.commentsTitle, { color: colors.text }]}>
              Comments ({comments.length})
            </Text>

            {isAuthenticated && (
              <View style={[styles.commentForm, { backgroundColor: colors.card }]}>
                <TextInput
                  style={[
                    styles.commentInput,
                    {
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="Write a comment..."
                  placeholderTextColor={colors.subText}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={2000}
                />
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    {
                      backgroundColor: colors.primary,
                      opacity: commentText.trim() && !submittingComment ? 1 : 0.5,
                    },
                  ]}
                  onPress={submitComment}
                  disabled={!commentText.trim() || submittingComment}
                >
                  <Text style={styles.submitBtnText}>
                    {submittingComment ? 'Posting...' : 'Post comment'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {!isAuthenticated && (
              <Text style={[styles.loginHint, { color: colors.subText }]}>
                Sign in to leave a comment.
              </Text>
            )}

            {comments.map((comment) => (
              <View key={comment.id} style={[styles.commentCard, { backgroundColor: colors.card }]}>
                <View style={styles.commentHeader}>
                  <Text style={[styles.commentAuthor, { color: colors.text }]}>
                    {displayName(comment)}
                  </Text>
                  <Text style={[styles.commentDate, { color: colors.subText }]}>
                    {formatDate(comment.createdAt)}
                  </Text>
                </View>
                <Text style={[styles.commentContent, { color: colors.text }]}>{comment.content}</Text>

                {comment.replies.map((reply) => (
                  <View
                    key={reply.id}
                    style={[styles.replyCard, { backgroundColor: colors.background, borderLeftColor: colors.primary }]}
                  >
                    <View style={styles.replyHeader}>
                      <Text style={[styles.replyAuthor, { color: colors.text }]}>
                        {displayName(reply)}
                      </Text>
                      <Text style={[styles.replyDate, { color: colors.subText }]}>
                        {formatDate(reply.createdAt)}
                      </Text>
                    </View>
                    <Text style={[styles.replyContent, { color: colors.text }]}>{reply.content}</Text>
                  </View>
                ))}

                {isAuthenticated && (
                  <View style={styles.replyForm}>
                    <TextInput
                      style={[
                        styles.replyInput,
                        {
                          backgroundColor: colors.background,
                          color: colors.text,
                          borderColor: colors.border,
                        },
                      ]}
                      placeholder="Reply..."
                      placeholderTextColor={colors.subText}
                      value={replyTextByCommentId[comment.id] ?? ''}
                      onChangeText={(t) =>
                        setReplyTextByCommentId((prev) => ({ ...prev, [comment.id]: t }))
                      }
                    />
                    <TouchableOpacity
                      style={[
                        styles.replySubmitBtn,
                        {
                          backgroundColor: colors.primary,
                          opacity:
                            (replyTextByCommentId[comment.id]?.trim() && !submittingReplyId)
                              ? 1
                              : 0.5,
                        },
                      ]}
                      onPress={() => submitReply(comment.id)}
                      disabled={
                        !replyTextByCommentId[comment.id]?.trim() ||
                        submittingReplyId === comment.id
                      }
                    >
                      <Text style={styles.replySubmitBtnText}>
                        {submittingReplyId === comment.id ? 'Posting...' : 'Reply'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { marginTop: 48 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  body: {
    padding: 16,
  },
  publishedDate: {
    fontSize: 13,
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
  commentsSection: {
    marginTop: 8,
    padding: 16,
    borderTopWidth: 1,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  commentForm: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  loginHint: {
    fontSize: 14,
    marginBottom: 16,
  },
  commentCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 15,
    fontWeight: '600',
  },
  commentDate: {
    fontSize: 12,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  replyCard: {
    marginLeft: 16,
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  replyAuthor: {
    fontSize: 14,
    fontWeight: '600',
  },
  replyDate: {
    fontSize: 11,
  },
  replyContent: {
    fontSize: 13,
    lineHeight: 18,
  },
  replyForm: {
    marginLeft: 16,
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  replySubmitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  replySubmitBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  empty: {
    margin: 16,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, textAlign: 'center' },
  headerBookmark: {
    marginRight: 8,
    padding: 4,
  },
});
