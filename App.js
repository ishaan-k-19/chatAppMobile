import { Provider } from 'react-redux';
import Main from './Main';
import store from './redux/store';
import LoadInitialState from './lib/LoadInitialState';
import { ThemeProvider } from './lib/themeContext';

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
      <LoadInitialState />
        <Main/>
      </ThemeProvider>
    </Provider>
)
}