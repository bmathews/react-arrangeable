import React, { Component, PropTypes } from "react";
import ResizeNode from "./resize-node";
import MODES from "./modes";

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

class Resizable extends Component {
  static displayName = "Resizable";

  static propTypes = {
    children: PropTypes.node,
    getSize: PropTypes.func,
    onResize: PropTypes.func,
    onResizeStart: PropTypes.func,
    onResizeStop: PropTypes.func,
    onRotate: PropTypes.func,
    resizeHorizontal: PropTypes.bool,
    resizeVertical: PropTypes.bool
  };

  static defaultProps = {
    onResizeStart: () => {},
    onResizeStop: () => {}
  };

  constructor(props) {
    super(props);
    this.state = {
      modes: this.getModes(props.resizeHorizontal, props.resizeVertical),
      resizeMode: null
    };
  }

  componentWillReceiveProps(nextProps) {
    const { resizeHorizontal: rh, resizeVertical: rv } = this.props;
    if (rh !== nextProps.resizeHorizontal || rv !== nextProps.resizeVertical) {
      this.setState({ modes: this.getModes(nextProps.resizeHorizontal, nextProps.resizeVertical) });
    }
  }

  getModes(resizeHorizontal, resizeVertical) {
    const modes = [];
    if (resizeHorizontal) {
      modes.push("RIGHT", "LEFT");
    }
    if (resizeVertical) {
      modes.push("TOP", "BOTTOM");
    }
    if (resizeVertical && resizeHorizontal) {
      modes.push("TOP_LEFT", "TOP_RIGHT", "BOTTOM_RIGHT", "BOTTOM_LEFT");
    }
    return modes;
  }

  getEventCoordinates = (e) => ({
    x: e.touches ? e.touches[0].clientX : e.clientX,
    y: e.touches ? e.touches[0].clientY : e.clientY
  })

  startResize = (e, resizeMode) => {
    e.preventDefault();
    e.stopPropagation();
    this.canvasPosition = document.getElementById("app").getBoundingClientRect();
    this.startMousePosition = this.getEventCoordinates(e);
    this.sizeAtStart = this.props.getSize();
    this.nodeCenter = this.getNodeCenter();
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.stopResize);
    document.addEventListener("touchmove", this.handleMouseMove);
    document.addEventListener("touchend", this.stopResize);
    this.props.onResizeStart(this.sizeAtStart);
    this.setState({ resizeMode });
  }

  stopResize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.stopResize);
    document.removeEventListener("touchmove", this.handleMouseMove);
    document.removeEventListener("touchend", this.stopResize);
    this.props.onResizeStop(this.state.resizeMode);
    this.setState({ resizeMode: null });
  }

  startRotate = (e, rotateMode) => {
    e.preventDefault();
    e.stopPropagation();
    this.canvasPosition = document.getElementById("app").getBoundingClientRect();
    this.nodeCenter = this.getNodeCenter();
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
    const { x: mouseX, y: mouseY } = this.getEventCoordinates(e);

    // find x/y distances between center/pivot point and mouse position
    const diffX = mouseX - (this.nodeCenter.x + this.canvasPosition.left);
    const diffY = (this.canvasPosition.top + this.nodeCenter.y) - mouseY;

    // find angle between mouse position and positive x-axis relative to rotated ResizeNode
    const angle = Math.atan2(diffY, diffX);
    const rotation = normalizedAngleMap[this.rotateMode] - angle;
    this.props.onRotate(rotation);
  }

  getNodeCenter = () => {
    const { left, top, width, height } = this.props.getSize();
    return {
      x: left + width / 2,
      y: top + height / 2
    };
  }

  handleMouseMove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { resizeMode } = this.state;
    const isEdge = resizeMode.indexOf("_") < 0;

    // get original and current mouse positions
    const { x: startX, y: startY } = this.startMousePosition;
    const { x: mouseX, y: mouseY } = this.getEventCoordinates(e);

    // find x/y distances between center/pivot point and mouse position
    const diffX = startX - (this.nodeCenter.x + this.canvasPosition.left);
    const diffY = (this.canvasPosition.top + this.nodeCenter.y) - startY;

    // clone start rectangle
    const rect = { ...this.sizeAtStart };

    // calculate distance and angle between original and current mouse positions
    const length = Math.sqrt(Math.pow(mouseX - startX, 2) + Math.pow(mouseY - startY, 2));
    const angle = Math.atan2(diffY, diffX);

    let heightDiff = 0;
    let widthDiff = 0;
    let topDiff = 0;
    let leftDiff = 0;

    // calculate position diffs of new rectangle
    if (rect.rotation === 0) {
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
        if (rect.rotation > PI * -0.5 && rect.rotation < PI * 0.5) {
          widthDiff = length * (mouseX > startX ? 1 : -1);
          topDiff = mouseY > startY;
        } else {
          widthDiff = length * (startX > mouseX ? 1 : -1);
          leftDiff = -widthDiff;
        }
      } else if (resizeMode === MODES.LEFT) {
        if (rect.rotation > PI * -0.5 && rect.rotation < PI * 0.5) {
          widthDiff = length * (startX > mouseX ? 1 : -1);
          leftDiff = -widthDiff;
        } else {
          widthDiff = length * (mouseX > startX ? 1 : -1);
        }
      } else if (resizeMode === MODES.TOP) {
        if (rect.rotation > PI * -0.5 && rect.rotation < PI * 0.5) {
          heightDiff = length * (startY > mouseY ? 1 : -1);
          topDiff = -heightDiff;
        } else {
          heightDiff = length * (mouseY > startY ? 1 : -1);
        }
      } else if (resizeMode === MODES.BOTTOM) {
        if (rect.rotation > PI * -0.5 && rect.rotation < PI * 0.5) {
          heightDiff = length * (mouseY > startY ? 1 : -1);
        } else {
          heightDiff = length * (startY > mouseY ? 1 : -1);
          topDiff = -heightDiff;
        }
      } else {
        console.log("height&width");
        // heightDiff = Math.sin(rect.rotation) * length;
        // widthDiff = Math.cos(rect.rotation) * length;
      }
    }

    rect.height += heightDiff;
    rect.width += widthDiff;
    rect.top += topDiff;
    rect.left += leftDiff;

    this.props.onResize(rect);
  }

  getResizeNodes = (nodeModes) => {
    return nodeModes.map((nodeMode) => {
      const mode = MODES[nodeMode];
      const alignProp = { [alignPropMap[mode]]: true };
      return (
        <ResizeNode
          {...alignProp}
          key={mode}
          mode={mode}
          activeMode={this.state.resizeMode}
          onResize={this.startResize}
          onRotate={this.startRotate}
        />
      );
    });
  }

  render() {
    return (
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        {this.props.children}
        {this.getResizeNodes(this.state.modes)}
      </div>
    );
  }
}

export default Resizable;
