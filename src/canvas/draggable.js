import React, { Component, PropTypes } from "react";
import MODES from "./modes";

class Draggable extends Component {
  static displayName = "Draggable";
  static propTypes = {
    draggable: PropTypes.bool,
    onDrag: PropTypes.func,
    onDragStart: PropTypes.func,
    onDragStop: PropTypes.func,
    getSize: PropTypes.func,
    children: PropTypes.node
  }

  static defaultProps = {
    onDragStart: () => {},
    onDragStop: () => {}
  }

  getEventCoordinates = (e) => ({
    x: e.touches ? e.touches[0].clientX : e.clientX,
    y: e.touches ? e.touches[0].clientY : e.clientY
  })

  startDrag = (e) => {
    if (!this.props.draggable) return;
    this.dragStartTime = Date.now();
    this.startMousePosition = this.getEventCoordinates(e);
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

    if (!this.dragStartTime) {
      this.props.onDragStop(MODES.MOVE);
    } else {
      this.dragStartTime = null;
    }
  }

  handleMouseDown = (e) => {
    this.startDrag(e);
  }

  handleMouseMove = (e) => {
    e.preventDefault();
    const coords = this.getEventCoordinates(e);
    if (this.dragStartTime && Date.now() - this.dragStartTime > 100 &&
       (coords.x !== this.startMousePosition.x || coords.y !== this.startMousePosition.y)) {
      this.dragStartTime = null;
      this.props.onDragStart(this.sizeAtStart);
    } else if (!this.dragStartTime) {
      e.stopPropagation();
      const targetSize = { ...this.sizeAtStart };
      targetSize.left += (coords.x - this.startMousePosition.x);
      targetSize.top += (coords.y - this.startMousePosition.y);
      this.moveTo(targetSize);
    }
  }

  moveTo(rect) {
    this.props.onDrag(rect);
  }

  render() {
    return (
      <div
        style={{ width: '100%', height: '100%', cursor: 'move' }}
        onMouseDown={this.handleMouseDown}
        onTouchStart={this.handleMouseDown}
      >
        {this.props.children}
      </div>
    );
  }
}

export default Draggable;
