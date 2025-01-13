import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import {createThumbnail} from 'react-native-create-thumbnail';
import {InteractionManager} from 'react-native';
import {transformImage} from '../../lib/features';

const AttachmentHandler = ({
  attachments,
  handleImageClick,
  handleDocumentClick,
  max = 4,
  maxcol = 2,
  isList,
  styling,
}) => {
  const videoRef = useRef(null);
  const [fullscreenVideo, setFullscreenVideo] = useState(null);
  const [videoThumbnails, setVideoThumbnails] = useState({});
  const [loadingThumbnails, setLoadingThumbnails] = useState({});

  const fileFormat = url => {
    const extension = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
    if (['mp4', 'mov', 'avi'].includes(extension)) return 'video';
    if (['mp3', 'wav'].includes(extension)) return 'audio';
    if (['pdf', 'doc', 'docx'].includes(extension)) return 'document';
    return 'unknown';
  };

  const generateVideoThumbnail = async (url, index) => {
    setLoadingThumbnails(prev => ({...prev, [index]: true}));
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
    setLoadingThumbnails(prev => ({...prev, [index]: false}));
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

  const handleVideoClick = url => {
    setFullscreenVideo(url);
  };

  const handleCloseVideo = () => {
    setFullscreenVideo(null);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const groupAttachments = (items, numColumns) => {
    const grouped = [];
    for (let i = 0; i < items.length; i += numColumns) {
      grouped.push(items.slice(i, i + numColumns));
    }
    return grouped;
  };

  const renderAttachmentItem = (item, index, isLastVisible, moreThanOne) => {
    const url = item.url;
    const file = fileFormat(url);

    switch (file) {
      case 'image':
        return (
          <TouchableOpacity key={index} onPress={() => handleImageClick(index)}>
            <View style={[styles.imageWrapper, styling]}>
              <Image
                source={{ uri: transformImage(url, 150) }}
                style={
                  isList || moreThanOne
                    ? styles.attachmentImage
                    : { ...styles.attachmentImage, width: 180, height: 200 }
                }
                resizeMode="cover"
              />
              {isLastVisible && (
                <View style={styles.extraOverlay}>
                  <Text style={styles.extraText}>
                    +{attachments.length - max}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );

      case 'video':
        return (
          <TouchableOpacity key={index} onPress={() => handleVideoClick(url)}>
            <View style={[styles.imageWrapper, styling]}>
              {loadingThumbnails[index] ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : (
                <Image
                  source={{
                    uri: transformImage(videoThumbnails[index]) || 'fallback-image-url',
                  }}
                  style={
                    isList || moreThanOne
                      ? styles.attachmentImage
                      : { ...styles.attachmentImage, width: 180, height: 200 }
                  }
                  resizeMode="cover"
                />
              )}
              <View style={styles.playButtonOverlay}>
                <Icon name="play-circle-outline" size={50} color="white" />
              </View>
            </View>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };


  const groupedAttachments = groupAttachments(
    attachments.slice(0, max),
    maxcol,
  );

  return (
    <View>
      {groupedAttachments.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
        {row.map((attachment, colIndex) => {
          const isLastVisible =
            rowIndex * maxcol + colIndex === max - 1 &&
            attachments.length > max;
          return renderAttachmentItem(
            attachment,
            rowIndex * maxcol + colIndex,
            isLastVisible,
            groupedAttachments.length > 0
          );
        })}
      </View>
      ))}
      {fullscreenVideo && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={!!fullscreenVideo}
          onRequestClose={handleCloseVideo}>
          <View style={styles.fullscreenVideoContainer}>
            <Video
              source={{uri: fullscreenVideo}}
              style={styles.fullscreenVideo}
              ref={videoRef}
              controls={true}
              resizeMode="cover"
              onError={error => {
                console.error('Error loading video', error);
                handleCloseVideo();
              }}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseVideo}>
              <Icon name="close-outline" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'start',
  },
  imageWrapper: {
    position: 'relative',
    margin: 2,
  },
  attachmentImage: {
    width: 116,
    height: 120,
    borderRadius: 5,
    objectFit: 'cover',
  },
  extraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  extraText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
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
});

export default AttachmentHandler;
