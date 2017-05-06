import React, { Component } from 'react';
import { Card, CardActions, CardTitle } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import { Link } from 'react-router-dom';

export default class DocumentCard extends Component {

  render() {
    return (
      <Card style={{margin: 5}}>
        <CardTitle
          title={this.props.document.title}
        />
        <Divider />
        <CardActions style={{display: 'flex', justifyContent: 'flex-end'}}>
          <Link to={`/document/${this.props.document.id}/${this.props.document.userId}`}>
            <RaisedButton>
              OPEN
            </RaisedButton>
          </Link>
        </CardActions>
      </Card>
    );
  }
}

DocumentCard.propTypes = {
  document: React.PropTypes.object.isRequired,
}