import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface Post {
  id: string;
  caption: string;
  imageUrl: string;
  authorName: string;
  createdAt: any;
  likes: number;
}

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData: Post[] = [];
      querySnapshot.forEach((doc) => {
        postsData.push({
          id: doc.id,
          ...doc.data(),
        } as Post);
      });
      setPosts(postsData);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Text style={styles.authorName}>{item.authorName}</Text>
        <Text style={styles.timestamp}>
          {item.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
        </Text>
      </View>
      
      <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      
      <View style={styles.postContent}>
        <Text style={styles.caption}>{item.caption}</Text>
        <TouchableOpacity style={styles.likeButton}>
          <Text style={styles.likes}>❤️ {item.likes} likes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  postContainer: {
    backgroundColor: 'white',
    marginBottom: 10,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  postImage: {
    width: '100%',
    height: 300,
  },
  postContent: {
    padding: 15,
  },
  caption: {
    fontSize: 16,
    marginBottom: 10,
  },
  likeButton: {
    alignSelf: 'flex-start',
  },
  likes: {
    color: '#666',
    fontSize: 14,
  },
});