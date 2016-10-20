import React, { Component, PropTypes } from "react";
import { getEventCoordinates } from "./utils";

class Rotatable extends Component {
  static displayName = "Rotatable";

  static propTypes = {
    children: PropTypes.node,
    getRect: PropTypes.func,
    hideHandle: PropTypes.bool,
    onRotate: PropTypes.func
  };

  startRotate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.canvasPosition = document.getElementById("app").getBoundingClientRect();
    this.startRect = this.props.getRect();
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
    const diffX = mouseX - (this.startRect.x + this.canvasPosition.left);
    const diffY = (this.canvasPosition.top + this.startRect.y) - mouseY;

    // find angle between mouse position and positive x-axis relative to rotated ResizeNode
    const angle = Math.atan2(diffY, diffX);
    this.props.onRotate(angle);
  }

  render() {
    const { children, hideHandle, isSelected } = this.props;

    return (
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        {children}
        {(isSelected && !hideHandle) && (
          <div
            className="rotateHandle"
            onMouseDown={this.startRotate}
            onTouchStart={this.startRotate}
          />
        )}
      </div>
    );
  }
}

export default Rotatable;
