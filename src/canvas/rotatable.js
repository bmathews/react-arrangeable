import React, { Component, PropTypes } from "react";
import { getEventCoordinates } from "./utils";

const PI = Math.PI;
const normalizedAngleMap ={
  RIGHT: 0,
  TOP_RIGHT: PI * 0.25,
  TOP: PI * 0.5,
  TOP_LEFT: PI * 0.75,
  LEFT: PI,
  BOTTOM_RIGHT: PI * -0.25,
  BOTTOM: PI * -0.5,
  BOTTOM_LEFT: PI * -0.75
};

class Rotatable extends Component {
  static displayName = "Rotatable";

  static propTypes = {
    children: PropTypes.node,
    getSize: PropTypes.func,
    getNodeCenter: PropTypes.func,
    onRotate: PropTypes.func,
  };

  startRotate = (e, rotateMode) => {
    e.preventDefault();
    e.stopPropagation();
    this.canvasPosition = document.getElementById("app").getBoundingClientRect();
    this.nodeCenter = this.props.getNodeCenter();
    this.rotateMode = rotateMode;
    document.addEventListener("mousemove", this.handleRotate);
    document.addEventListener("mouseup", this.stopRotate);
    document.addEventListener("touchmove", this.handleRotate);
    document.addEventListener("touchend", this.stopRotate);
  }

  stopRotate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.removeEventListener("mousemove", this.handleRotate);
    document.removeEventListener("mouseup", this.stopRotate);
    document.removeEventListener("touchmove", this.handleRotate);
    document.removeEventListener("touchend", this.stopRotate);
  }

  handleRotate = (e) => {
    // get mouse position
    const { x: mouseX, y: mouseY } = getEventCoordinates(e);

    // find x/y distances between center/pivot point and mouse position
    const diffX = mouseX - (this.nodeCenter.x + this.canvasPosition.left);
    const diffY = (this.canvasPosition.top + this.nodeCenter.y) - mouseY;

    // find angle between mouse position and positive x-axis relative to rotated ResizeNode
    const angle = Math.atan2(diffY, diffX);
    const rotation = normalizedAngleMap[this.rotateMode] - angle;
    this.props.onRotate(rotation);
  }

  render() {
    return (
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        {this.props.children}
      </div>
    );
  }
}

export default Rotatable;
