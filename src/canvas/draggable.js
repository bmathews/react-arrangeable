import React, { Component, PropTypes } from "react";
import { getEventCoordinates } from "./utils";

class Draggable extends Component {
  static displayName = "Draggable";

  static propTypes = {
    children: PropTypes.node,
    draggable: PropTypes.bool,
    getSize: PropTypes.func,
    onDrag: PropTypes.func
  };

  startDrag = (e) => {
    if (!this.props.draggable) return;
    this.startMousePosition = getEventCoordinates(e);
    this.sizeAtStart = this.props.getSize();
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.stopDrag);
    document.addEventListener("touchmove", this.handleMouseMove);
    document.addEventListener("touchend", this.stopDrag);
  }

  stopDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.stopDrag);
    document.removeEventListener("touchmove", this.handleMouseMove);
    document.removeEventListener("touchend", this.stopDrag);
  }

  handleMouseDown = (e) => {
    this.startDrag(e);
  }

  handleMouseMove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const coords = getEventCoordinates(e);
    const targetSize = { ...this.sizeAtStart };
    targetSize.left += (coords.x - this.startMousePosition.x);
    targetSize.top += (coords.y - this.startMousePosition.y);
    this.props.onDrag(targetSize);
  }

  render() {
    return (
      <div
        style={{ width: "100%", height: "100%", cursor: "move" }}
        onMouseDown={this.handleMouseDown}
        onTouchStart={this.handleMouseDown}
      >
        {this.props.children}
      </div>
    );
  }
}

export default Draggable;
