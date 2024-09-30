import { useState, useEffect } from 'react';
import * as React from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, Dialog, Portal, PaperProvider, Text, Searchbar, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { setIsSearch } from '../../redux/reducers/misc';
import { useLazySearchUserQuery, useSendFriendRequestMutation } from '../../redux/api/api';
import { useAsyncMutation } from '../../hooks/hooks';
import UserItem from '../shared/UserItem'
import { useTheme } from '../../lib/themeContext';
import Icon from 'react-native-vector-icons/Ionicons';



const Search = () => {

    const dispatch = useDispatch();

    const {isSearch} = useSelector(state => state.misc);

  const [searchUser] = useLazySearchUserQuery();

  const [sendFriendRequest, isLoadingSendFriendRequest] = useAsyncMutation(
    useSendFriendRequestMutation
  );

  const [search, setSearch] = useState('');

  const [users, setUsers] = useState("");

  const addFriendHandler = async (id) => {
    await sendFriendRequest("Sending friend request...", { userId: id });
  };

  const {theme} = useTheme()

  const closeHandler = () =>{
        dispatch(setIsSearch(false))
    }

    useEffect(() => {
      if (!search.trim()) return setUsers([]);
  
      const timeOutId = setTimeout(() => {
        searchUser(search)
          .then(({ data }) => setUsers(data.users))
          .catch((e) => console.log(e));
      }, 100);

      return () => {
        clearTimeout(timeOutId);
      };
    }, [search]);



  return (
    <Dialog
    visible={isSearch}
    onDismiss={closeHandler}
    style={{ backgroundColor: theme.detailcont, height: "60%" }}
  >
    <Dialog.Title>
      <Text style={{
        color: theme.text
      }}>Find People</Text>

    </Dialog.Title>
    <Dialog.Content>
    <View style={[styles.searchContainer, {backgroundColor: theme.srchbarbg}]}>
          <Icon name="search" size={20} color="#888" style={styles.iconStyle} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search"
            style={[styles.inputStyle, {color: theme.text}]}
            placeholderTextColor="#888"
          />
        </View>
    <ScrollView style={{ height: "70%", paddingTop: 10 , width: "90%", alignSelf: "center"
    }}>
      { isLoadingSendFriendRequest ? (
          <ActivityIndicator size="large" color="#6d28d9" />
        ) : (users.length === 0
          ? <Text style={{
            fontSize: 16,
            padding: 10,
            color: "#999",
            textAlign: 'center',
          }} >No results found</Text>
          : users.map((i) => (
              <UserItem
                user={i}
                key={i._id}
                handler={addFriendHandler}
                handlerIsLoading={isLoadingSendFriendRequest}
                usern={true}
                styling={{
                  backgroundColor: "transparent",
                }}
              />
            ))
      )}
    </ScrollView>
    </Dialog.Content>
  </Dialog>
)
}

const styles = StyleSheet.create({
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
});

export default Search;