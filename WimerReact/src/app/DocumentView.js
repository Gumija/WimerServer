import React, { Component } from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import FontIcon from 'material-ui/FontIcon';
import SvgIcon from 'material-ui/SvgIcon';
import RaisedButton from 'material-ui/RaisedButton';
import rangy from 'rangy/lib/rangy-core.js';
import Digital from 'react-activity/lib/Digital';
import ReactMarkdown from 'react-markdown';
import { GithubPicker } from 'react-color';

export default class DocumentView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      highlightEnabled: null,
      unhighlightEnabled: false,
      showColorPicker: false,
      buttons: [
        {
          position: 1,
          color: 'rgba(255,0,0,0.6)',
          applierName: 'c255-0-0-60',
        },
        {
          position: 1,
          color: 'rgba(0,255,0,0.6)',
          applierName: 'c0-255-0-60',
        },
        {
          position: 1,
          color: 'rgba(0,0,255,0.6)',
          applierName: 'c0-0-255-60',
        }
      ]
    }
  }

  componentWillUnmount() {
    // TODO: remove added stylesheets
  }

  componentDidMount() {
    // eslint-disable-next-line
    this.highlighter = rangy.createHighlighter();
    this.highlighter.onHighlightAdded = this.props.onHighlightAdded;
    this.highlighter.onHighlightRemoved = this.props.onHighlightRemoved;
    this.addColorStyle(255, 0, 0, .6, 'c255-0-0-60')
    this.addColorStyle(0, 255, 0, .6, 'c0-255-0-60')
    this.addColorStyle(0, 0, 255, .6, 'c0-0-255-60')
  }

  componentDidUpdate(prevProps, prevState) {
    if ((prevProps.highlightsString.str !== this.props.highlightsString.str || 
      this.highlighter.serialize() == 'type:textContent')
      && this.presenter &&
      this.props.highlightsString.str.match(/c\d+-\d+-\d+-\d+/g)) {
      for (let m of this.props.highlightsString.str.match(/c\d+-\d+-\d+-\d+/g)) {
        // eslint-disable-next-line
        let colors = m.match(/\d+/g);
        this.addColorStyle(parseInt(colors[0], 10), parseInt(colors[1], 10), parseInt(colors[2], 10), parseInt(colors[3], 10) / 100, m);
      }
      this.highlighter.deserialize(this.props.highlightsString.str)
    }
  }

  addColorStyle = (r, g, b, a, name) => {
    // Add stylesheet    
    let sheet = document.createElement('style')
    sheet.innerHTML = `.${name} {background-color: rgba(${r},${g},${b},${a});}`;
    document.body.appendChild(sheet);
    // Add class applier
    this.highlighter.addClassApplier(rangy.createClassApplier(name, {
      ignoreWhiteSpace: true,
      tagNames: ["span"]
    }));
  }

  highlightSelection = (applierName) => {
    this.highlighter.highlightSelection(applierName, { containerElementId: 'presenter' });
    window.getSelection().removeAllRanges();
  }

  unhighlightSelection = () => {
    this.highlighter.unhighlightSelection();
    window.getSelection().removeAllRanges();
  }

  onHighlightButtonPress = (applierName) => {
    // eslint-disable-next-line
    if (!this.state.unhighlightEnabled && window.getSelection().rangeCount > 0 && window.getSelection().getRangeAt(0).toString() != "") {
      // A range is selected, highlight it
      this.highlightSelection(applierName);
      return;
    } else {
      // No range is selected (Un)bind events and highlight on mouseup/touchend (setting up auto highlighting)
      if (this.state.highlightEnabled === applierName) {
        this.disableHighlight();
      } else {
        this.enableHighlight(applierName);
        this.disableUnhighlight();
      }
    }
  }

  enableHighlight = (applierName) => {
    this.disableHighlight();
    let event = () => this.highlightSelection(applierName);
    this.setState({ highlightEnabled: applierName, event: event });
    this.presenter.addEventListener('mouseup', event);
    this.presenter.addEventListener('touchend', event);
  }

  disableHighlight = () => {
    this.presenter.removeEventListener('mouseup', this.state.event);
    this.presenter.removeEventListener('touchend', this.state.event);
    this.setState({ highlightEnabled: null, event: null });
  }

  onUnhighlightButtonPress = () => {
    // eslint-disable-next-line
    if (!this.state.highlightEnabled && window.getSelection().rangeCount > 0 && window.getSelection().getRangeAt(0).toString() != "") {
      // A range is selected, highlight it
      this.unhighlightSelection();
      return;
    } else {
      // No range is selected (Un)bind events and highlight on mouseup/touchend (setting up auto highlighting)
      if (this.state.unhighlightEnabled) {
        this.disableUnhighlight();
      } else {
        this.enableUnhighlight();
        this.disableHighlight();
      }
    }
  }

  enableUnhighlight = () => {
    this.setState({ unhighlightEnabled: true });
    this.presenter.addEventListener('mouseup', this.unhighlightSelection);
    this.presenter.addEventListener('touchend', this.unhighlightSelection);
  }

  disableUnhighlight = () => {
    this.setState({ unhighlightEnabled: false });
    this.presenter.removeEventListener('mouseup', this.unhighlightSelection);
    this.presenter.removeEventListener('touchend', this.unhighlightSelection);
  }

  onShowColorColorPicker = (value) => {
    this.setState({
      showColorPicker: value === undefined ? !this.state.showColorPicker : value,
    });
  }

  addNewColor = (color, event) => {
    console.log(color);
    // add style and class applier
    let className = `c${color.rgb.r}-${color.rgb.g}-${color.rgb.b}-${Math.floor(color.rgb.a * 100)}`;
    this.addColorStyle(color.rgb.r, color.rgb.g, color.rgb.b, color.rgb.a, className);
    // add button
    let buttons = this.state.buttons;
    buttons.push(
      {
        position: 1,
        color: `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`,
        applierName: className,
      }
    )
    buttons.splice(0, 1);
    this.setState({ buttons: buttons });
    this.onShowColorColorPicker(false);
    this.onHighlightButtonPress(className);
  }

  onStartHighlighting = () => {
    this.props.onStartHighlighting();
  }

  render() {
    return (
      /* Used to center stuff. This will be Navigated */
      <div style={{ marginLeft: '10%', marginRight: '10%' }}>
        {this.props.loading ?
          <div>
            <div id="presenter" ref={(div) => this.presenter = div}
              style={{
                borderLeftStyle: 'solid', borderLeftColor: 'black', borderLeftWidth: 1,
                borderRightStyle: 'solid', borderRightColor: 'black', borderRightWidth: 1,
                paddingLeft: 15, paddingRight: 15
              }}>
              <ReactMarkdown source={this.props.file.file} />
            </div>
            {!this.props.user &&
              <div style={{
                position: 'fixed', bottom: 0, right: 0, margin: 8, display: 'flex',
                alignItems: 'center', justifyContent: 'center', width: 245,
                wordWrap: 'normal', backgroundColor: 'rgba(220,220,220,1)',
                padding: 16, textAlign: 'center',
                borderWidth: 2, borderRadius: 2, borderStyle: 'solid', borderColor: 'white'
              }}>
                Log in to add highlights
              </div>
            }
            {this.props.user && this.props.user.id !== this.props.document.userId &&
              <RaisedButton onTouchTap={this.onStartHighlighting} label="START HIGHLIGHTING" primary={true} style={{
                position: 'fixed', bottom: 0, right: 0, margin: 8,
              }} />
            }
            {this.props.user && this.props.user.id === this.props.document.userId &&
              <div style={{ position: 'fixed', bottom: 0, right: 0, display: 'flex', flexDirection: 'row-reverse' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: 8, paddingBottom: 8 }}>
                  <FloatingActionButton className=""
                    backgroundColor={'rgba(240,240,240,1)'}
                    style={this.state.unhighlightEnabled ?
                      { alignItems: 'center', justifyContect: 'center', border: 1, borderStyle: 'dashed', borderColor: 'grey' }
                      :
                      { alignItems: 'center', justifyContect: 'center', margin: 1 }
                    }
                    onTouchTap={this.onUnhighlightButtonPress}
                    mini={true} >
                    <SvgIcon>
                      <path fill="grey" d="M15.14,3C14.63,3 14.12,3.2 13.73,3.59L2.59,14.73C1.81,15.5 1.81,16.77 2.59,17.56L5.03,20H12.69L21.41,11.27C22.2,10.5 22.2,9.23 21.41,8.44L16.56,3.59C16.17,3.2 15.65,3 15.14,3M17,18L15,20H22V18" />
                    </SvgIcon>
                  </FloatingActionButton>
                  <FloatingActionButton className={''}
                    backgroundColor={this.state.buttons[0].color}
                    style={this.state.highlightEnabled === this.state.buttons[0].applierName ?
                      { alignItems: 'center', justifyContect: 'center', border: 1, borderStyle: 'dashed', borderColor: this.state.buttons[0].color }
                      :
                      { alignItems: 'center', justifyContect: 'center', margin: 1 }
                    }
                    onTouchTap={() => this.onHighlightButtonPress(this.state.buttons[0].applierName)}>
                    <FontIcon className="material-icons" style={{ color: 'white' }}>border_color</FontIcon>
                  </FloatingActionButton>
                  <FloatingActionButton className={''}
                    backgroundColor={this.state.buttons[1].color}
                    style={this.state.highlightEnabled === this.state.buttons[1].applierName ?
                      { alignItems: 'center', justifyContect: 'center', border: 1, borderStyle: 'dashed', borderColor: this.state.buttons[1].color }
                      :
                      { alignItems: 'center', justifyContect: 'center', margin: 1 }
                    }
                    onTouchTap={() => this.onHighlightButtonPress(this.state.buttons[1].applierName)}>
                    <FontIcon className="material-icons" style={{ color: 'white' }}>border_color</FontIcon>
                  </FloatingActionButton>
                  <FloatingActionButton className={''}
                    backgroundColor={this.state.buttons[2].color}
                    style={this.state.highlightEnabled === this.state.buttons[2].applierName ?
                      { alignItems: 'center', justifyContect: 'center', border: 1, borderStyle: 'dashed', borderColor: this.state.buttons[2].color }
                      :
                      { alignItems: 'center', justifyContect: 'center', margin: 1 }
                    }
                    onTouchTap={() => this.onHighlightButtonPress(this.state.buttons[2].applierName)}>
                    <FontIcon className="material-icons" style={{ color: 'white' }}>border_color</FontIcon>
                  </FloatingActionButton>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'flex-end', paddingBottom: 8, paddingRight: 8 }}>
                  <FloatingActionButton
                    backgroundColor={'rgba(255,255,255,1)'}
                    style={{ alignItems: 'center', justifyContect: 'center', marginBottom: 8 }}
                    onTouchTap={() => this.onShowColorColorPicker()}
                    mini={true}>
                    <FontIcon className="material-icons" style={{ color: 'grey' }}>add</FontIcon>
                  </FloatingActionButton>
                  {this.state.showColorPicker &&
                    <div>
                      <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0 }}
                        onClick={() => this.onShowColorColorPicker()}
                      />
                      <div style={{ transform: 'rotate(180deg)', marginBottom: 10, marginRight: 2 }}>
                        <GithubPicker colors={[
                    /*'rgba(255,0,0,0.6)',*/ 'rgba(184, 0, 0, 0.6)', 'rgba(219, 62, 0, 0.6)', 'rgba(252, 203, 0, 0.6)', 'rgba(0, 139, 2, 0.6)',
                          'rgba(0, 107, 118, 0.6)', 'rgba(18, 115, 222, 0.6)', 'rgba(0, 77, 207, 0.6)', 'rgba(83, 0, 235, 0.6)',
                        ]}
                          onChangeComplete={this.addNewColor} />
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          :
          <div style={{
            alignSelf: 'center',
            justifyContent: 'center',
            display: 'flex',
            marginTop: 60,
          }}>
            <Digital size={40} />
          </div>
        }
      </div >
    );
  }
}

DocumentView.propTypes = {
  document: React.PropTypes.object,
}