import React, { Component, PropTypes } from "react";
import ResizeHandle from "./resize-handle";
import { getEventCoordinates } from "./utils";

const alignPropMap = {
  TOP: "alignTop",
  RIGHT: "alignRight",
  BOTTOM: "alignBottom",
  LEFT: "alignLeft",
  TOP_LEFT: "cornerTopLeft",
  TOP_RIGHT: "cornerTopRight",
  BOTTOM_RIGHT: "cornerBottomRight",
  BOTTOM_LEFT: "cornerBottomLeft"
};
const modes = Object.keys(alignPropMap);

class Resizable extends Component {
  static displayName = "Resizable";

  static propTypes = {
    children: PropTypes.node,
    elementIndex: PropTypes.number,
    getRect: PropTypes.func,
    isSelected: PropTypes.bool,
    onResize: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = { resizeMode: null };
  }

  startResize = (e, resizeMode) => {
    e.preventDefault();
    e.stopPropagation();
    const { elementIndex, getRect } = this.props;
    this.canvasPosition = document.getElementById("app").getBoundingClientRect();
    this.boundingBox = document.getElementById(`Node-${elementIndex}`).getBoundingClientRect();
    this.startMousePosition = getEventCoordinates(e);
    this.startRect = getRect();
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.stopResize);
    document.addEventListener("touchmove", this.handleMouseMove);
    document.addEventListener("touchend", this.stopResize);
    this.setState({ resizeMode });
  }

  stopResize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.stopResize);
    document.removeEventListener("touchmove", this.handleMouseMove);
    document.removeEventListener("touchend", this.stopResize);
    this.setState({ resizeMode: null });
  }

  handleMouseMove = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // clone start rectangle
    const newRect = { ...this.startRect };

    // get mouse position
    const { x: mouseX, y: mouseY } = getEventCoordinates(e);

    const {
      rotation,
      height: startHeight,
      width: startWidth,
      x: startX,
      y: startY,
    } = this.startRect;

    // convert angle from degrees to radians
    const angle = Math.abs(rotation * Math.PI / 180);
    const _cos = Math.cos(angle);
    const _sin = Math.sin(angle);

    // find x/y distances between original and current mouse positions
    let dragX = mouseX - this.startMousePosition.x;
    let dragY = mouseY - this.startMousePosition.y;
    dragX = dragX * _cos + dragY * _sin;
    dragY = dragY * _cos + dragX * _sin;

    // find dimensions of resized rectangle before rotation
    const newWidth = startWidth + dragX;
    const newHeight = startHeight + dragY;

    // find dimensions of resized rectangle after rotation
    const newOuterWidth = Math.round(newWidth * _cos + newHeight  * _sin);
    const newOuterHeight = Math.round(newHeight * _cos + newWidth * _sin);
    const newX = startX + (newOuterWidth - this.boundingBox.width) / 2;
    const newY = startY + (newOuterHeight - this.boundingBox.height) / 2;

    newRect.x = newX;
    newRect.y = newY;
    newRect.height = newHeight;
    newRect.width = newWidth;

    this.props.onResize(newRect);
  }

  getResizeHandles = () => {
    return modes.map((mode, i) => {
      const alignProp = { [alignPropMap[mode]]: true };
      return (
        <ResizeHandle
          {...alignProp}
          key={i}
          mode={mode}
          onResize={this.startResize}
        />
      );
    });
  }

  render() {
    return (
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        {this.props.children}
        {this.props.isSelected && this.getResizeHandles()}
      </div>
    );
  }
}

export default Resizable;
