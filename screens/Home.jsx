import React, {useCallback, useEffect, useState} from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  AppState
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import ChatItem from '../components/shared/ChatItem';
import {useGetMessagesQuery, useMyChatsQuery} from '../redux/api/api';
import Search from '../components/specified/Search';
import {
  setIsNewGroup,
  setIsNotification,
  setIsSearch,
} from '../redux/reducers/misc';
import NewGroup from '../components/specified/NewGroup';
import Notification from '../components/specified/Notification';
import {getSocket} from '../socket';
import {useSocketEvents} from '../hooks/hooks';
import {
  NEW_MESSAGE_ALERT,
  NEW_REQUEST,
  ONLINE_USERS,
  REFETCH_CHATS,
} from '../constants/events';
import {
  incrementNotification,
  setNewMessagesAlert,
} from '../redux/reducers/chat';
import {getOrSaveFromStorage} from '../lib/features';
import {ActivityIndicator, Badge, Button, Searchbar, ToggleButton} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import OTPDialog from '../components/dialog/OTPDialog';
import {useTheme} from '../lib/themeContext';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';


const Home = ({navigation}) => {
  const {user} = useSelector(state => state.auth);
  const socket = getSocket();

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [otherUser, setOtherUser] = useState();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const {theme, toggleTheme, isDarkMode} = useTheme();

  const [appState, setAppState] = useState(AppState.currentState);


  const {notificationCount, newMessagesAlert} = useSelector(
    state => state.chat,
  );
  const dispatch = useDispatch();
  const {isLoading, data, refetch} = useMyChatsQuery('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = data?.chats?.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const newRequestListener = useCallback(() => {
    dispatch(incrementNotification());
  }, [dispatch, appState]);

  const refetchListener = useCallback(() => {
    refetch();
    setRefreshing(false);
  }, [refetch]);

  const onlineUsersListener = useCallback(
    data => {
      setOnlineUsers(data);
    },
    [ONLINE_USERS],
  );

  const newMessagesAlertListener = useCallback(data => {
    dispatch(setNewMessagesAlert(data));
    refetch();
  }, [NEW_MESSAGE_ALERT, appState]);

  useEffect(() => {
    const saveNotificationCount = async () => {
      try {
        await getOrSaveFromStorage({
          key: NEW_REQUEST,
          save: true,
          value: notificationCount,
        });
      } catch (error) {
        console.error('Error saving notification count:', error);
      }
    };
    if (notificationCount !== undefined) {
      saveNotificationCount();
    }
  }, [notificationCount]);

  useEffect(() => {
    const saveMessageCount = async () => {
      try {
        await getOrSaveFromStorage({
          key: NEW_MESSAGE_ALERT,
          save: true,
          value: newMessagesAlert,
        });
      } catch (error) {
        console.error('Error saving Messages count:', error);
      }
    };
    if (newMessagesAlert !== undefined) {
      saveMessageCount();
    }
  }, [newMessagesAlert]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetchListener();
    setRefreshKey(prevKey => prevKey + 1);
  }, [refetchListener]);

  const eventHandlers = {
    [NEW_MESSAGE_ALERT]: newMessagesAlertListener,
    [NEW_REQUEST]: newRequestListener,
    [REFETCH_CHATS]: refetchListener,
    [ONLINE_USERS]: onlineUsersListener,
  };

  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prevKey => prevKey + 1);
    }, []),
  );
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
    });
  
    return () => {
      subscription.remove();
    };
  }, []);
  

  useSocketEvents(socket, eventHandlers);

  return isLoading ? (
    <ActivityIndicator size="large" color="#6d28d9" />

  ) : (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.background}]}
      key={refreshKey}>
      <View style={styles.appBar}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text style={[styles.titleText, {color: theme.titleTxt}]}>
            ConvoCube
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 10,
            }}>
            <View style={styles.iconContainer}>
              <TouchableOpacity onPress={() => dispatch(setIsSearch(true))}>
                <Icon name="person-add" size={24} color={theme.icon} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{position: 'relative'}}
                onPress={() => dispatch(setIsNotification(true))}>
                {notificationCount > 0 && (
                  <Badge
                    style={{
                      position: 'absolute',
                      zIndex: 10,
                      top: -7,
                      right: -5,
                      backgroundColor: 'red',
                    }}>
                    {notificationCount}
                  </Badge>
                )}
                <Icon name="notifications" size={24} color={theme.icon} />
              </TouchableOpacity>
            </View>
            <Menu>
              <MenuTrigger
                customStyles={{TriggerTouchableComponent: TouchableOpacity}}>
                <View style={styles.menuTrigger}>
                  <Icon name="ellipsis-vertical" size={23} color={theme.icon} />
                </View>
              </MenuTrigger>

              <MenuOptions
                customStyles={{
                  optionsContainer: [styles.menuContainer, {backgroundColor: theme.menubg}],
                }}>
                <MenuOption
                  style={styles.menuOpt} 
                  onSelect={() => dispatch(setIsNewGroup(true))}>
                  <Icon name="add-circle" size={24} color={theme.menuIcon} />
                  <Text style={{color: theme.text}}>New Group</Text>
                </MenuOption>
                <View style={styles.separator} />
                <MenuOption
                  style={styles.menuOpt} 
                  onSelect={toggleTheme}>
                  <Icon name={theme.toggleIcon} size={24} color={theme.menuIcon} />
                  <Text style={{color: theme.text}}>{theme.toggleText}</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>
        </View>

        <View style={[styles.searchContainer, {backgroundColor: theme.srchbarbg}]}>
          <Icon name="search" size={20} color="#888" style={styles.iconStyle} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search"
            style={[styles.inputStyle, {color: theme.text}]}
            placeholderTextColor="#888"
          />
        </View>
      </View>
      <ScrollView
  style={styles.scrollView}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>
  {/* Show message and button if no chats found */}
  {filteredChats?.length === 0 ? (
    <View style={{ alignItems: 'center', marginTop: 16 }}>
      <Text style={{ color: 'gray', fontSize: 18, textAlign: 'center', marginBottom: 16 }}>
        No chats found
      </Text>
      <TouchableOpacity style={{
        backgroundColor: "#e5e5e5",
        borderRadius: 50,
        padding: 10,
        width: '40%',
        alignSelf: 'center',
        marginTop: 12,
        justifyContent: 'center',
        alignItems: 'center',
      }} onPress={() => dispatch(setIsSearch(true))}>
          <Text style={{
            color: "gray",
            fontSize: 12,
          }}>Add Friends</Text>
      </TouchableOpacity >
    </View>
  ) : null}

  {filteredChats?.map((data, index) => {
    const { avatar, _id, name, groupChat, members } = data;

    const newMessageAlert = newMessagesAlert.find(({ chatId }) => chatId === _id);

    const isOnline = members?.some((member) => onlineUsers.includes(member));

    return (
      <View key={_id} style={{ flexDirection: 'column' }}>
        <ChatItem
          navigation={navigation}
          index={index}
          avatar={avatar}
          name={name}
          _id={_id}
          groupChat={groupChat}
          sameSender={_id}
          newMessageAlert={newMessageAlert}
          socket={socket}
          isOnline={isOnline}
        />
      </View>
    );
  })}
</ScrollView>

      <Search />
      <NewGroup />
      <Notification />
      {!user?.verified && <OTPDialog />}
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    marginTop: 15,
    paddingHorizontal: 10,
    height: 100,
    borderRadius: 3,
    marginTop: 10,
    gap: 10,
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    height: 40,
  },
  iconStyle: {
    marginRight: 10,
  },
  inputStyle: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  menuTrigger: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    borderRadius: 10,
    width: '35%',
    padding: 5,
  },
  
  menuOpt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 9,

  },
});
