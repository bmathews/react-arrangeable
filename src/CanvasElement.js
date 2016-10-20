import React, { Component, PropTypes } from "react";
import Rotatable from "./canvas/rotatable";
import Resizable from "./canvas/resizable";
import Draggable from "./canvas/draggable";

class CanvasElement extends Component {
  static propTypes = {
    children: PropTypes.node,
    getRect: PropTypes.func,
    isSelected: PropTypes.bool,
    onDrag: PropTypes.func,
    onResize: PropTypes.func,
    onRotate: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = { isResizing: false };
  }

  handleResize = (newRect, isResizing) => {
    this.setState({ isResizing });

    if (isResizing) {
      this.props.onResize(newRect);
    }
  }

  render() {
    const { children, onDrag, onRotate, ...otherProps } = this.props;
    delete otherProps.onResize;

    return (
      <Rotatable
        onRotate={onRotate}
        hideHandle={this.state.isResizing}
        {...otherProps}
      >
        <Resizable
          onResize={this.handleResize}
          {...otherProps}
        >
          <Draggable
            onDrag={onDrag}
            {...otherProps}
          >
            {children}
          </Draggable>
        </Resizable>
      </Rotatable>
    );
  }
}

export default CanvasElement;
