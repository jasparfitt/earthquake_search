import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class LoadingWindow extends Component {
  render() {
    return (
      ReactDOM.createPortal(
        this.props.children,
        document.getElementById('portal')
      )
    );
  }
}

export default LoadingWindow;
