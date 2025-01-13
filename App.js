import { Provider } from 'react-redux';
import Main from './Main';
import store from './redux/store';
import LoadInitialState from './lib/LoadInitialState';
import { ThemeProvider } from './lib/themeContext';
// Uncomment the following if Running on IOS
// import { Platform } from 'react-native';
// import RNFS from 'react-native-fs';
// import { useEffect } from 'react';
// import { LogBox } from 'react-native';

export default function App() {

  // Uncomment the following if Running on IOS
  // useEffect(() => {
  //   const path = Platform.OS === 'ios' 
  //     ? `${RNFS.DocumentDirectoryPath}/ip.txt`  
  //     : `${RNFS.ExternalStorageDirectoryPath}/ip.txt`; 

  //   RNFS.writeFile(path, 'your data here', 'utf8')
  //     .then(() => console.log('File written successfully!'))
  //     .catch(err => console.error('Error writing file:', err));
  // }, []);

  return (
    <Provider store={store}>
      <ThemeProvider>
      <LoadInitialState />
        <Main/>
      </ThemeProvider>
    </Provider>
)
}