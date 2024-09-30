import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Button, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useCameraDevices, useCameraPermission } from 'react-native-vision-camera';
import Icon from "react-native-vector-icons/Ionicons";
import { launchImageLibrary as _launchImageLibrary } from 'react-native-image-picker';
let launchImageLibrary = _launchImageLibrary;

export default function App({navigation, route}) {
  const [permissionStatus, setPermissionStatus] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [cameraType, setCameraType] = useState('back')
  const device = useCameraDevice(cameraType)

  const cameraRef = useRef(null); 
  
  

  const requestPermission = async () => {
    const newPermissionStatus = await Camera.requestCameraPermission();
    setPermissionStatus(newPermissionStatus === 'granted');
  };

  useEffect(() => {
    const checkPermissions = async () => {
      const cameraStatus = await Camera.getCameraPermissionStatus();
      setPermissionStatus(cameraStatus === 'granted');
    };
    checkPermissions();
  }, []);

  
  const PermissionsPage = () => (
    <View style={styles.container}>
      <Text>Camera permission is required to use the camera.</Text>
      <Button title="Grant Permission" onPress={requestPermission} />
    </View>
  );
  
  const NoCameraDeviceError = () => (
    <View style={styles.container}>
      <Text>No camera device found. Please check your device or permissions.</Text>
    </View>
  );
  
  useEffect(() => {
    if (device) {
      setLoading(false); 
    } else {
      setLoading(false);
    }
  }, [device]);
  
  if (permissionStatus === null) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (permissionStatus === false) {
    return <PermissionsPage />;
  }


  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  if(!device){
    return <NoCameraDeviceError />;
  }

  const switchCamera = () => {
    setCameraType((prevType) => (prevType === 'back' ? 'front' : 'back'));
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const data = await cameraRef.current.takePhoto();
        const imageUri = `file://${data.path}`;
        
        if (route.params.screen) {
          const screen = route.params.screen;
          const params = route.params.chatId 
            ? { chatId: route.params.chatId, image: imageUri } 
            : { image: imageUri };
          
          return navigation.navigate(screen, params);
        }
      } catch (error) {
        console.log('Error capturing photo:', error);
      }
    }
  };
  

const openImagePicker = async () => {
  const options = {
    mediaType: 'photo',
    includeBase64: false,
    maxHeight: 2000,
    maxWidth: 2000,
  };
  
  launchImageLibrary(options, handleResponse);
}

const handleResponse = (response) => {
  if (response.didCancel) {
    console.log('User cancelled image picker');
  } else if (response.error) {
    console.log('Image picker error: ', response.error);
  } else {
    let imageUri = response.uri || response.assets?.[0]?.uri;

    if (route.params.screen) {
      const screen = route.params.screen;
      const params = route.params.chatId 
        ? { chatId: route.params.chatId, image: imageUri } 
        : { image: imageUri };

      return navigation.navigate(screen, params);
    }
  }
};


  return (
    <View style={styles.container}>
      <Camera
        style={[StyleSheet.absoluteFill, {height: "90%"}]}
        device={device}
        isActive={true}
        ref={cameraRef} 
        photo={true} 
      />

      <View style={styles.buttonContainer}>
        <Icon name="images" size={40}  color="#fff" onPress={openImagePicker} />
        <Icon name="aperture" size={40}  color="#fff" onPress={takePhoto} />
        <Icon name="camera-reverse" size={40}  color="#fff" onPress={switchCamera} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  buttonContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 25,
    width: "100%",
    justifyContent: "space-evenly",
  }
});
