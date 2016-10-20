import React, { Component, PropTypes } from "react";
import { getEventCoordinates } from "./utils";

class Draggable extends Component {
  static displayName = "Draggable";

  static propTypes = {
    children: PropTypes.node,
    getRect: PropTypes.func,
    isSelected: PropTypes.bool,
    onDrag: PropTypes.func
  };

  startDrag = (e) => {
    this.startMousePosition = getEventCoordinates(e);
    this.startRect = this.props.getRect();
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

  handleMouseMove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const currentMousePosition = getEventCoordinates(e);
    const newRect = { ...this.startRect };
    newRect.left += (currentMousePosition.x - this.startMousePosition.x);
    newRect.top += (currentMousePosition.y - this.startMousePosition.y);
    this.props.onDrag(newRect);
  }

  render() {
    return (
      <div
        style={{ width: "100%", height: "100%", cursor: "move" }}
        onMouseDown={this.startDrag}
        onTouchStart={this.startDrag}
      >
        {this.props.children}
      </div>
    );
  }
}

export default Draggable;
