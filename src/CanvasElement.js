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
  onRotate: PropTypes.func,
  resizeHorizontal: PropTypes.bool,
  resizeVertical: PropTypes.bool
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
      onRotate,
      resizeHorizontal,
      resizeVertical
    } = this.props;

    return (
      <Resizable
        getSize={getSize}
        onResize={onResize}
        onResizeStart={onResizeStart}
        onResizeStop={onResizeStop}
        onRotate={onRotate}
        resizeHorizontal={resizeHorizontal}
        resizeVertical={resizeVertical}
      >
        <Draggable
          getSize={getSize}
          onDrag={onDrag}
          onDragStart={onDragStart}
          onDragStop={onDragStop}
          draggable={draggable}
        >
          {children}
        </Draggable>
      </Resizable>
    );
  }
}

export default CanvasElement;
