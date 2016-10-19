import React, { Component, PropTypes } from "react";
import ResizeHandle from "./resize-handle";
import MODES from "./modes";
import { getEventCoordinates } from "./utils";

const alignPropMap ={
  TOP: "alignTop",
  RIGHT: "alignRight",
  BOTTOM: "alignBottom",
  LEFT: "alignLeft",
  TOP_LEFT: "cornerTopLeft",
  TOP_RIGHT: "cornerTopRight",
  BOTTOM_RIGHT: "cornerBottomRight",
  BOTTOM_LEFT: "cornerBottomLeft"
};

const PI = Math.PI;
const modes = ["RIGHT", "LEFT", "TOP", "BOTTOM", "TOP_LEFT", "TOP_RIGHT", "BOTTOM_RIGHT", "BOTTOM_LEFT"];

class Resizable extends Component {
  static displayName = "Resizable";

  static propTypes = {
    children: PropTypes.node,
    getRect: PropTypes.func,
    isSelected: PropTypes.bool,
    onResize: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      resizeMode: null
    };
  }

  startResize = (e, resizeMode) => {
    e.preventDefault();
    e.stopPropagation();
    this.canvasPosition = document.getElementById("app").getBoundingClientRect();
    this.startMousePosition = getEventCoordinates(e);
    this.startRect = this.props.getRect();
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
    const { resizeMode } = this.state;
    const isEdge = resizeMode.indexOf("_") < 0;

    // get original and current mouse positions
    const { x: startX, y: startY } = this.startMousePosition;
    const { x: mouseX, y: mouseY } = getEventCoordinates(e);

    // find x/y distances between center/pivot point and mouse position
    const diffX = startX - (this.startRect.x + this.canvasPosition.left);
    const diffY = (this.canvasPosition.top + this.startRect.y) - startY;

    // clone start rectangle
    const newRect = { ...this.startRect };

    // calculate distance and angle between original and current mouse positions
    const length = Math.sqrt(Math.pow(mouseX - startX, 2) + Math.pow(mouseY - startY, 2));
    const angle = Math.atan2(diffY, diffX);

    let heightDiff = 0;
    let widthDiff = 0;
    let topDiff = 0;
    let leftDiff = 0;

    // calculate position diffs of new rectangle
    if (newRect.rotation === 0) {
      if (isEdge) {
        if (angle > PI * 0.25 && angle < PI * 0.75) { // top
          heightDiff = startY - mouseY;
          topDiff = -heightDiff;
        } else if ((angle > PI * 0.75 && angle < PI) || (angle > PI * -1 && angle < PI * -0.75)) { // left
          widthDiff = startX - mouseX;
          leftDiff = -widthDiff;
        } else if (angle > PI * -0.75 && angle < -0.25) { // bottom
          heightDiff = mouseY - startY;
        } else if ((angle > PI * -0.25 && angle < 0) || (angle > 0 && angle < PI * 0.25)) { // right
          widthDiff = mouseX - startX;
        }
      } else {
        if (angle > 0 && angle <= PI * 0.5) { // topRight
          heightDiff = startY - mouseY;
          widthDiff = mouseX - startX;
          topDiff = -heightDiff;
        } else if (angle > 0.5 && angle <= PI) { // topLeft
          heightDiff = startY - mouseY;
          widthDiff = startX - mouseX;
          topDiff = -heightDiff;
          leftDiff = -widthDiff;
        } else if (angle > PI * -1 && angle <= PI * -0.5) { // bottomLeft
          heightDiff = mouseY - startY;
          widthDiff = startX - mouseX;
          leftDiff = -widthDiff;
        } else if (angle > PI * -0.5 && angle <= 0) { // bottomRight
          heightDiff = mouseY - startY;
          widthDiff = mouseX - startX;
        }
      }
    } else {
      if (resizeMode === MODES.RIGHT) {
        if (newRect.rotation > PI * -0.5 && newRect.rotation < PI * 0.5) {
          widthDiff = length * (mouseX > startX ? 1 : -1);
          topDiff = mouseY > startY;
        } else {
          widthDiff = length * (startX > mouseX ? 1 : -1);
          leftDiff = -widthDiff;
        }
      } else if (resizeMode === MODES.LEFT) {
        if (newRect.rotation > PI * -0.5 && newRect.rotation < PI * 0.5) {
          widthDiff = length * (startX > mouseX ? 1 : -1);
          leftDiff = -widthDiff;
        } else {
          widthDiff = length * (mouseX > startX ? 1 : -1);
        }
      } else if (resizeMode === MODES.TOP) {
        if (newRect.rotation > PI * -0.5 && newRect.rotation < PI * 0.5) {
          heightDiff = length * (startY > mouseY ? 1 : -1);
          topDiff = -heightDiff;
        } else {
          heightDiff = length * (mouseY > startY ? 1 : -1);
        }
      } else if (resizeMode === MODES.BOTTOM) {
        if (newRect.rotation > PI * -0.5 && newRect.rotation < PI * 0.5) {
          heightDiff = length * (mouseY > startY ? 1 : -1);
        } else {
          heightDiff = length * (startY > mouseY ? 1 : -1);
          topDiff = -heightDiff;
        }
      } else {
        console.log("height&width");
        // heightDiff = Math.sin(newRect.rotation) * length;
        // widthDiff = Math.cos(newRect.rotation) * length;
      }
    }

    newRect.height += heightDiff;
    newRect.width += widthDiff;
    newRect.y += topDiff;
    newRect.x += leftDiff;

    this.props.onResize(newRect);
  }

  getResizeHandles = () => {
    return modes.map((mode) => {
      const nodeMode = MODES[mode];
      const alignProp = { [alignPropMap[nodeMode]]: true };
      return (
        <ResizeHandle
          {...alignProp}
          key={nodeMode}
          mode={nodeMode}
          activeMode={this.state.resizeMode}
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
