import React, { Component } from 'react';
import DocumentCard from './DocumentCard';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import FontIcon from 'material-ui/FontIcon';
import Dialog from 'material-ui/Dialog';
import Dropzone from 'react-dropzone';
import DocumentService from './services/DocumentService';

import './Home.css';

import { inject, observer } from 'mobx-react';

@inject("documentStore")
@observer
export default class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
    }
  }

  async componentWillMount() {
    await DocumentService.getDocuments();
  }

  handleDrop = async (acceptedFiles) => {
    console.log(acceptedFiles[0])
    // TODO: start upload spinner

    try {
      // upload the single file in acceptedFiles
      let data = new FormData()
      data.append('doc', acceptedFiles[0])

      let req = new Request('/upload', {
        method: 'POST',
        body: data
      })
      console.log('req', req);

      let res = await fetch(req)
      let json = await res.json()



      console.log('json', json)
      if (res.status) {
        this.setState({ open: false })
        // Create document object in store
        let doc = {
          id: json.id,
          title: acceptedFiles[0].name,
          preview: "",
          last_opened: new Date(),
          fileType: acceptedFiles[0].type,
        }
        this.props.documentStore.addDocumentInfo(doc);
        // TODO: navigate to document


      } else {
        // TODO: show error message
      }
    } catch (err) {
      // TODO: show network error message
      // Couldn't connect server, please try again later.
    }
  }

  render() {
    return (
      /* Used to center stuff. This will be Navigated */
      <div className="home-container">
        <p className="section-header">Recent</p>
        <div className="card-container">
          {this.props.documentStore.recentDocs.map((doc) =>
            <DocumentCard document={doc} key={doc.id} />
          )}
        </div>
        {/*<p className="section-header">Uploads</p>
        <div className="card-container">
          {this.props.documentStore.uploadedDocs.map((doc) =>
            <DocumentCard document={doc} key={doc.id} />
          )}
        </div>*/}
        <FloatingActionButton className="absolute-fab" onTouchTap={() => this.setState({ open: true })}>
          <FontIcon className="material-icons">file_upload</FontIcon>
        </FloatingActionButton>
        <Dialog
          modal={false}
          open={this.state.open}
          onRequestClose={() => this.setState({ open: false })}>
          <Dropzone
            style={{ backgroundColor: 'lightgrey', height: 240, display: 'flex' }}
            activeStyle={{ backgroundColor: 'lightgreen' }}
            rejectStyle={{ backgroundColor: 'red' }}
            accept={'text/plain,application/pdf'}
            maxSize={120000000}
            multiple={false}
            onDrop={this.handleDrop}>
            {({ isDragActive, isDragReject, acceptedFiles, rejectedFiles }) => {
              return (
                <span style={{ display: 'flex', flex: 1, flexDirection: 'column', alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' }}>
                  {!isDragActive && !isDragReject &&
                    <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' }}>
                      <FontIcon className="material-icons" style={{ fontSize: 120 }} color='grey'>file_upload</FontIcon>
                      <p style={{ color: 'grey' }}>Drop a file here or click to select one</p>
                    </div>
                  }
                  {isDragActive &&
                    <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' }}>
                      <FontIcon className="material-icons" style={{ fontSize: 120 }} color='green'>done</FontIcon>
                      {/*<FontIcon className="material-icons">check_circle</FontIcon>*/}
                      <p style={{ color: 'green' }}>Drop a file here or click to select one</p>
                    </div>
                  }
                  {isDragReject &&
                    <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' }}>
                      <FontIcon className="material-icons" style={{ fontSize: 120 }} color='darkred'>block</FontIcon>
                      <p style={{ color: 'darkred' }}>Drop a file here or click to select one</p>
                    </div>
                  }
                </span>)
            }}
          </Dropzone>
        </Dialog>
      </div >
    );
  }
}