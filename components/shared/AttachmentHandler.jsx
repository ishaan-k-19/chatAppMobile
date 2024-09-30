import React, { useState, useRef, useEffect } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, Modal, ActivityIndicator, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import { createThumbnail } from 'react-native-create-thumbnail';
import { InteractionManager } from 'react-native';
import { transformImage } from '../../lib/features';

const AttachmentHandler = ({ attachments, handleImageClick, handleDocumentClick, max, maxcol, isList }) => {


  const videoRef = useRef(null);
  const [fullscreenVideo, setFullscreenVideo] = useState(null);
  const [videoThumbnails, setVideoThumbnails] = useState({});
  const [loadingThumbnails, setLoadingThumbnails] = useState({});

  const fileFormat = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
    if (['mp4', 'mov', 'avi'].includes(extension)) return 'video';
    if (['mp3', 'wav'].includes(extension)) return 'audio';
    if (['pdf', 'doc', 'docx'].includes(extension)) return 'document';
    return 'unknown';
  };

  const isMultiple = attachments.length > 1;
  const maxAttachments = max;
  const extraCount = attachments.length - maxAttachments;

  const generateVideoThumbnail = async (url, index) => {
    setLoadingThumbnails(prev => ({ ...prev, [index]: true }));
    try {
      const thumbnail = await createThumbnail({
        url,
        timeStamp: 1000,
      });
      setVideoThumbnails(prev => ({
        ...prev,
        [index]: thumbnail.path,
      }));
    } catch (error) {
      console.error('Error generating video thumbnail', error);
    }
    setLoadingThumbnails(prev => ({ ...prev, [index]: false }));
  };

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      attachments.forEach((attachment, index) => {
        const file = fileFormat(attachment.url);
        if (file === 'video') {
          generateVideoThumbnail(attachment?.url, index);
        }
      });
    });
    return () => task.cancel();
  }, [attachments]);

  const handleVideoClick = (url) => {
    setFullscreenVideo(url);
  };

  const handleCloseVideo = () => {
    setFullscreenVideo(null);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const renderAttachmentItem = ({ item, index }) => {
    const url = item.url;
    const file = fileFormat(url);
    const isLastVisible = index === maxAttachments - 1 && extraCount > 0;

    switch (file) {
      case 'image':
        return (
          <TouchableOpacity key={index} onPress={() => handleImageClick(index)}>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: transformImage(url)}}
                style={[
                  styles.attachmentImage,
                  isMultiple && styles.smallImage,
                  isList && styles.listImageView,
                ]}
                resizeMode="cover"
              />
              {isLastVisible && (
                <View style={styles.extraOverlay}>
                  <Text style={styles.extraText}>+{extraCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );

      case 'video':
        return (
          <TouchableOpacity key={index} onPress={() => handleVideoClick(url)}>
            <View style={styles.imageWrapper}>
              {loadingThumbnails[index] ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : (
                <Image
                  source={{ uri: transformImage(videoThumbnails[index]) || 'fallback-image-url' }}
                  style={[
                    styles.attachmentImage,
                  isMultiple && styles.smallImage,
                  isList && styles.listImageView,

                  ]}
                  resizeMode="cover"
                />
              )}
              <View style={styles.playButtonOverlay}>
                <Icon name="play-circle-outline" size={50} color="white" />
              </View>
            </View>
          </TouchableOpacity>
        );

      case 'audio':
        return (
          <View key={index} style={styles.audioContainer}>
            <TouchableOpacity onPress={() => handleDocumentClick(url)}>
              <Icon name="play-circle-outline" size={isMultiple ? 30 : 50} color="#000" />
            </TouchableOpacity>
            <Text>{item.name || 'Audio File'}</Text>
          </View>
        );

      case 'document':
        return (
          <TouchableOpacity key={index} style={styles.documentContainer} onPress={() => handleDocumentClick(url)}>
            <Icon name="document-outline" size={isMultiple ? 30 : 40} color="#000" />
            <Text>{item.name || 'Document'}</Text>
          </TouchableOpacity>
        );

      case 'unknown':
        return (
          <View key={index} style={styles.documentContainer}>
            <Icon name="alert-circle-outline" size={40} color="#000" />
            <Text>Unsupported File</Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View>
      <FlatList
        data={attachments.slice(0, maxAttachments)}
        renderItem={renderAttachmentItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={maxcol}  // Set the number of columns to 3 for grid layout
        columnWrapperStyle={styles.columnWrapper}  // Styling for the row of items
        contentContainerStyle={styles.grid}
      />

      {/* Full-screen Video Modal */}
      {fullscreenVideo && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={!!fullscreenVideo}
          onRequestClose={handleCloseVideo}
        >
          <View style={styles.fullscreenVideoContainer}>
            <Video
              source={{ uri: fullscreenVideo }}
              style={styles.fullscreenVideo}
              ref={videoRef}
              controls={true}
              resizeMode="cover"
              onError={(error) => {
                console.error('Error loading video', error);
                handleCloseVideo();
              }}
            />
            <TouchableOpacity style={styles.closeButton} onPress={handleCloseVideo}>
              <Icon name="close-outline" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    justifyContent: 'center'
  },
  columnWrapper: {
    justifyContent: 'flex-start',
  },
  imageWrapper: {
    position: 'relative',
    margin: 2,
  },
  attachmentImage: {
    width: 180,
    height: 200,
    borderRadius: 10,
  },
  smallImage: {
    width: 90,
    height: 90,
  },
  listImageView:{
    width: 115,
    height: 115,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  fullscreenVideo: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  audioContainer: {
    alignItems: 'center',
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    marginHorizontal: 5,
    justifyContent: 'center',
  },
  documentContainer: {
    alignItems: 'center',
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    marginHorizontal: 5,
    justifyContent: 'center',
  },
  extraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  extraText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default AttachmentHandler;