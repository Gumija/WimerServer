import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Page from './app/Page';
import { Provider as MobxProvider } from 'mobx-react';
import DocumentStore from './app/stores/DocumentStore';
import UserStore from './app/stores/UserStore';
import rangy from 'rangy/lib/rangy-core.js';
import 'rangy/lib/rangy-highlighter';
import 'rangy/lib/rangy-classapplier';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: '#303F9F',
    primary2Color: '#3F51B5',
    primary3Color: '#C5CAE9',
  }
});
console.log(muiTheme);

class App extends Component {

  componentWillMount(){
    rangy.init();
    console.dir(DocumentStore);
  }

  render() {
    return (
      <MobxProvider documentStore={DocumentStore} userStore={UserStore}>
        <MuiThemeProvider muiTheme={muiTheme}>
          <Page />
        </MuiThemeProvider>
      </MobxProvider>
    );
  }
}

export default App;
