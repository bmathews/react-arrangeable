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

  render() {
    const { children, onDrag, onResize, onRotate, ...otherProps } = this.props;

    return (
      <Rotatable onRotate={onRotate} {...otherProps}>
        <Resizable onResize={onResize} {...otherProps}>
          <Draggable onDrag={onDrag} {...otherProps}>
            {children}
          </Draggable>
        </Resizable>
      </Rotatable>
    );
  }
}

export default CanvasElement;
