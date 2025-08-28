import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { auth, storage, db } from '../firebaseConfig';

const { width } = Dimensions.get('window');

interface CreatePostScreenProps {
  navigation: any;
}

export default function CreatePostScreen({ navigation }: CreatePostScreenProps) {
  const [caption, setCaption] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    // Request gallery permissions first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Photo library access is needed to select images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio like Instagram
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // Request camera permissions first
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const filename = `posts/${auth.currentUser?.uid}/${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);
    
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const createPost = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please select an image');
      return;
    }

    if (!caption.trim()) {
      Alert.alert('Error', 'Please add a caption');
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await uploadImage(imageUri);
      
      await addDoc(collection(db, 'posts'), {
        caption: caption.trim(),
        imageUrl,
        authorId: auth.currentUser?.uid,
        authorName: auth.currentUser?.displayName || 'BJJ Practitioner',
        createdAt: new Date(),
        likes: 0,
        comments: [],
      });

      Alert.alert('Success', 'Post shared successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      
      // Reset form
      setImageUri(null);
      setCaption('');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>New Post</Text>

        {/* Image Section */}
        <View style={styles.imageSection}>
          {imageUri ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.selectedImage} />
              <TouchableOpacity 
                style={styles.changeImageButton}
                onPress={() => setImageUri(null)}
              >
                <Text style={styles.changeImageText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderTitle}>Add Photo</Text>
              <Text style={styles.placeholderSubtitle}>Share your BJJ journey</Text>
              
              <View style={styles.imageButtonsContainer}>
                <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                  <Text style={styles.imageButtonText}>Gallery</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                  <Text style={styles.imageButtonText}>Camera</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Caption Section */}
        <View style={styles.captionSection}>
          <Text style={styles.captionLabel}>Caption</Text>
          <TextInput
            style={styles.captionInput}
            placeholder="Write about your training, technique, or BJJ journey..."
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={2000}
            returnKeyType="done"
            blurOnSubmit={true}
          />
          <Text style={styles.characterCount}>
            {caption.length}/2000
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[
            styles.shareButton, 
            (!imageUri || !caption.trim() || loading) && styles.shareButtonDisabled
          ]} 
          onPress={createPost}
          disabled={!imageUri || !caption.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.shareButtonText}>Share Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 100, // Space for fixed button
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#1a1a1a',
  },
  imageSection: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  imageContainer: {
    alignItems: 'center',
  },
  selectedImage: {
    width: width - 40,
    height: width - 40,
    borderRadius: 12,
    marginBottom: 15,
  },
  changeImageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e9ecef',
    borderRadius: 20,
  },
  changeImageText: {
    color: '#495057',
    fontSize: 14,
    fontWeight: '500',
  },
  imagePlaceholder: {
    height: width - 40,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 30,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  imageButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  imageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  captionSection: {
    marginHorizontal: 20,
  },
  captionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  captionInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#6c757d',
    marginTop: 5,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  shareButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  shareButtonDisabled: {
    backgroundColor: '#adb5bd',
    shadowOpacity: 0,
    elevation: 0,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});