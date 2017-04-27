import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Page from './app/Page';
import { Provider as MobxProvider } from 'mobx-react';
import DocumentStore from './app/stores/DocumentStore';
import rangy from 'rangy/lib/rangy-core.js';
import 'rangy/lib/rangy-highlighter';
import 'rangy/lib/rangy-classapplier';

class App extends Component {

  componentWillMount(){
    rangy.init();
    console.dir(DocumentStore);
  }

  render() {
    return (
      <MobxProvider documentStore={DocumentStore}>
        <MuiThemeProvider>
          <Page />
        </MuiThemeProvider>
      </MobxProvider>
    );
  }
}

export default App;
