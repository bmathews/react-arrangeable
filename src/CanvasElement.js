import React, { Component, PropTypes } from "react";
import Resizable from "./canvas/resizable";
import Draggable from "./canvas/draggable";

export const CanvasElementPropTypes = {
  children: PropTypes.node,
  draggable: PropTypes.bool,
  getSize: PropTypes.func,
  onDrag: PropTypes.func,
  onDragStart: PropTypes.func,
  onDragStop: PropTypes.func,
  isDragging: PropTypes.bool,
  isPlaceholder: PropTypes.bool,
  isResizing: PropTypes.bool,
  isSelected: PropTypes.bool,
  onResize: PropTypes.func,
  onResizeStart: PropTypes.func,
  onResizeStop: PropTypes.func,
  resizeHorizontal: PropTypes.bool,
  resizeVertical: PropTypes.bool,
  scale: PropTypes.number.isRequired,
};

class CanvasElement extends Component {
  static propTypes = CanvasElementPropTypes;

  render() {
    const {
      children,
      draggable,
      getSize,
      onDrag,
      onDragStart,
      onDragStop,
      onResize,
      onResizeStart,
      onResizeStop,
      resizeHorizontal,
      resizeVertical,
      scale
    } = this.props;

    const sizeProps = { getSize, scale };
    const resizeProps = { onResize, onResizeStart, onResizeStop, resizeHorizontal, resizeVertical };
    const dragProps = { onDrag, onDragStart, onDragStop, draggable };

    return (
      <Resizable {...sizeProps} {...resizeProps}>
        <Draggable {...sizeProps} {...dragProps}>
          {children}
        </Draggable>
      </Resizable>
    );
  }
}

export default CanvasElement;
