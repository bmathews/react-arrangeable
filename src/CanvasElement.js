import React, { Component, PropTypes } from "react";
import Rotatable from "./canvas/rotatable";
import Resizable from "./canvas/resizable";
import Draggable from "./canvas/draggable";

class CanvasElement extends Component {
  static propTypes = {
    children: PropTypes.node,
    draggable: PropTypes.bool,
    getSize: PropTypes.func,
    isSelected: PropTypes.bool,
    onDrag: PropTypes.func,
    onResize: PropTypes.func,
    onRotate: PropTypes.func
  };

  getNodeCenter = () => {
    const { left, top, width, height } = this.props.getSize();
    return {
      x: left + width / 2,
      y: top + height / 2
    };
  }

  render() {
    const { children, draggable, getSize, isSelected, onDrag, onResize, onRotate } = this.props;

    return (
      <Rotatable
        getSize={getSize}
        getNodeCenter={this.getNodeCenter}
        isSelected={isSelected}
        onRotate={onRotate}
      >
        <Resizable
          getSize={getSize}
          getNodeCenter={this.getNodeCenter}
          isSelected={isSelected}
          onResize={onResize}
        >
          <Draggable
            draggable={draggable}
            getSize={getSize}
            onDrag={onDrag}
          >
            {children}
          </Draggable>
        </Resizable>
      </Rotatable>
    );
  }
}

export default CanvasElement;
