import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import axios from "axios";
import React, { useEffect } from "react";
import { Text } from "react-native";
import { MenuProvider } from "react-native-popup-menu";
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from "react-redux";
import Footer from "./components/specified/Footer";
import { server } from "./constants/config";
import { userExists, userNotExists } from "./redux/reducers/auth";
import Attachments from "./screens/Attachments";
import CameraComponent from "./screens/Camera";
import ChangePassword from "./screens/ChangePassword";
import Chat from "./screens/Chat";
import GroupManagement from "./screens/GroupManagement";
import Groups from "./screens/Groups";
import Home from "./screens/Home";
import Login from "./screens/Login";
import Profile from "./screens/Profile";
import Signup from "./screens/Signup";
import UserProfile from "./screens/UserProfile";
import { SocketProvider } from "./socket";
import EditProfile from "./screens/EditProfile";
import { ActivityIndicator } from "react-native-paper";
import ResetPassword from "./screens/ResetPassword";

const Stack = createNativeStackNavigator();

const Main = () => {
  const { user, loader } = useSelector((state) => state.auth);
  const dispatch = useDispatch();


  useEffect(() => {
    let isMounted = true;
  
    axios
      .get(`${server}/api/v1/user/me`, { withCredentials: true })
      .then(({ data }) => {
        if (isMounted) {
          dispatch(userExists(data.user));
        }
      })
      .catch(() => {
        if (isMounted) {
          dispatch(userNotExists());
        }
      });
  
    return () => {
      isMounted = false; 
    };
  }, [dispatch]);
  

  return (
    <SocketProvider> 
      <MenuProvider>
      <NavigationContainer>
        {loader ? (
                    <ActivityIndicator size="large" color="#6d28d9" />

        ) : (
          <Stack.Navigator initialRouteName={user ? "home" : "login"}>
            <Stack.Screen name="login" component={Login} options={{ headerShown: false }} />
            <Stack.Screen name="signup" component={Signup} options={{ headerShown: false }} />
            <Stack.Screen name="home" component={Home} options={{ headerShown: false }} />
            <Stack.Screen name="chat" component={Chat} options={{ headerShown: false }} />
            <Stack.Screen name="profile" component={Profile} options={{ headerShown: false }} />
            <Stack.Screen name="groups" component={Groups} options={{ headerShown: false }} />
            <Stack.Screen name="camera" component={CameraComponent} options={{ headerShown: false }} />
            <Stack.Screen name="groupmanagement" component={GroupManagement} options={{ headerShown: false }} />
            <Stack.Screen name="userprofile" component={UserProfile} options={{ headerShown: false }} />
            <Stack.Screen name="attachments" component={Attachments} options={{ headerShown: false }} />
            <Stack.Screen name="changepassword" component={ChangePassword} options={{ headerShown: false }} />
            <Stack.Screen name="editprofile" component={EditProfile} options={{ headerShown: false }} />
            <Stack.Screen name="reset" component={ResetPassword} options={{ headerShown: false }} />
          </Stack.Navigator>
        )}
        {user && <Footer />}
        <Toast/>
      </NavigationContainer>
        </MenuProvider>
    </SocketProvider>
  );
};

export default Main;
