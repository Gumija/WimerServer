import React, { Component } from 'react';
import { GithubPicker } from 'react-color';

export default class ColorPicker extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showColorPicker: false,
    }
  }


  onShowColorColorPicker = (value) => {
    this.setState({
      showColorPicker: value === undefined ? !this.state.showColorPicker : value,
    });
  }

  render() {
    return (
      <div>
        <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0 }}
          onClick={() => this.onShowColorColorPicker()}
        />
        <div style={{ transform: 'rotate(180deg)', marginBottom: 10, marginRight: 2 }}>
          <GithubPicker colors={[
                    /*'rgba(255,0,0,0.6)',*/ 'rgba(184, 0, 0, 0.6)', 'rgba(219, 62, 0, 0.6)', 'rgba(252, 203, 0, 0.6)', 'rgba(0, 139, 2, 0.6)',
            'rgba(0, 107, 118, 0.6)', 'rgba(18, 115, 222, 0.6)', 'rgba(0, 77, 207, 0.6)', 'rgba(83, 0, 235, 0.6)',
          ]}
            onChangeComplete={this.props.addNewColor} />
        </div>
      </div>
    )
  }
}