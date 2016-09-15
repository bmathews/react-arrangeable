import React, { Component, PropTypes } from "react";
import Resizable from "./canvas/resizable";
import Draggable from "./canvas/draggable";

export const CanvasElementPropTypes = {
  onDrag: PropTypes.func,
  onDragStart: PropTypes.func,
  onDragStop: PropTypes.func,
  onResize: PropTypes.func,
  onResizeStart: PropTypes.func,
  onResizeStop: PropTypes.func,
  draggable: PropTypes.bool,
  resizeHorizontal: PropTypes.bool,
  resizeVertical: PropTypes.bool,
  scale: PropTypes.number.isRequired,
  isDragging: PropTypes.bool,
  isSelected: PropTypes.bool,
  isResizing: PropTypes.bool,
  isPlaceholder: PropTypes.bool,
  getSize: PropTypes.func,
  children: PropTypes.node
};

class CanvasElement extends Component {
  static propTypes = CanvasElementPropTypes

  render() {
    return (
      <Resizable
        getSize={this.props.getSize}
        onResize={this.props.onResize}
        onResizeStart={this.props.onResizeStart}
        onResizeStop={this.props.onResizeStop}
        resizeHorizontal={this.props.resizeHorizontal}
        resizeVertical={this.props.resizeVertical}
        scale={this.props.scale}
      >
        <Draggable
          getSize={this.props.getSize}
          onDrag={this.props.onDrag}
          onDragStart={this.props.onDragStart}
          onDragStop={this.props.onDragStop}
          draggable={this.props.draggable}
          scale={this.props.scale}
        >
          {this.props.children}
        </Draggable>
      </Resizable>
    );
  }
}

export default CanvasElement;
