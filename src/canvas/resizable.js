import React, { Component, PropTypes } from "react";
import ResizeHandle from "./resize-handle";
import { getEventCoordinates } from "./utils";
import MODES from './modes';

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

    // clone start rectangle
    const newRect = {...this.startRect};
    const {
      rotation,
      x: startX,
      y: startY,
      height: startHeight,
      width: startWidth
    } = this.startRect;

    // get mouse position
    const { x: mouseX, y: mouseY } = getEventCoordinates(e);

    // determine whether we can resize horizontally and vertically
    const resizingHorizontally = resizeMode !== MODES.TOP && resizeMode !== MODES.BOTTOM;
    const resizingVertically = resizeMode !== MODES.LEFT && resizeMode !== MODES.RIGHT;

    // convert angle from degrees to radians, cache cosine & sine
    const angle = rotation * Math.PI / 180;
    const _cos = Math.cos(angle);
    const _sin = Math.sin(angle);

    // calculate mouse offset
    let dx = mouseX - this.startMousePosition.x;
    let dy = mouseY - this.startMousePosition.y;
    dx = dx * _cos + dy * _sin;
    dy = dy * _cos - dx * _sin;

    // find horizontal deltas
    if (resizingHorizontally) {
      if ([MODES.TOP_LEFT, MODES.LEFT, MODES.BOTTOM_LEFT].indexOf(resizeMode) > -1) { // left side
        newRect.x += dx;
        newRect.width -= dx;
      } else {
        newRect.width += dx;
      }
    }

    // find vertical deltas
    if (resizingVertically) {
      if ([MODES.TOP_LEFT, MODES.TOP, MODES.TOP_RIGHT].indexOf(resizeMode) > -1) { // top side
        newRect.y += dy;
        newRect.height -= dy;
      } else {
        newRect.height += dy;
      }
    }

    // get diffs between newRect and startRect
    const delta = {
      x: newRect.x - startX,
      y: newRect.y - startY,
      height: newRect.height - startHeight,
      width: newRect.width - startWidth
    };

    // calculate the correct position offset based on angle
    const offset = this.getCorrection(startWidth, startHeight, delta.width, delta.height, angle);
    const newX = delta.x * _cos - delta.y * _sin;
    const newY = delta.y * _cos + delta.x * _sin;
    newRect.x = startX;
    newRect.y = startY;
    newRect.x += newX;
    newRect.y += newY;

    newRect.x -= offset.x;
    newRect.y += offset.y;

    this.props.onResize(newRect);
  }

  getCorrection = (startWidth, startHeight, deltaWidth, deltaHeight, angle) => {
    // cache cosine & sine
    const _cos = Math.cos(angle);
    const _sin = Math.sin(angle);

    // get position after rotation with original size
    let x = -startWidth / 2;
    let y = startHeight / 2;
    let newX = y * _sin + x * _cos;
    let newY = y * _cos - x * _sin;
    const diff1 = { x: newX - x, y: newY - y };

    const newWidth = startWidth + deltaWidth;
    const newHeight = startHeight + deltaHeight;

    // get position after rotation with new size
    x = -newWidth / 2;
    y = newHeight / 2;
    newX = y * _sin + x * _cos;
    newY = y * _cos - x * _sin;
    const diff2 = { x: newX - x, y: newY - y };

    // get the difference between the two positions
    const offset = { x: diff2.x - diff1.x, y: diff2.y - diff1.y };
    return offset;
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
