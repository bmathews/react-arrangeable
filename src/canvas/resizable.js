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
    resizeVertical: PropTypes.bool,
    scale: PropTypes.number.isRequired
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
    this.startMousePosition = this.getEventCoordinates(e);
    this.sizeAtStart = this.props.getSize();
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
    this.startMousePosition = this.getEventCoordinates(e);
    this.canvasPosition = document.getElementById("app").getBoundingClientRect();
    this.pivotPoint = this.getNodeCenter();
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
    /// get mouse position
    const { x: mouseX, y: mouseY } = this.getEventCoordinates(e);

    // find x/y distances between pivot point and mouse position
    const diffX = mouseX - (this.pivotPoint.x + this.canvasPosition.left);
    const diffY = (this.canvasPosition.top + this.pivotPoint.y) - mouseY;

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
    const { scale } = this.props;

    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

    // Determine whether we can resize horizontally and vertically
    const resizingHorizontally = resizeMode !== MODES.TOP && resizeMode !== MODES.BOTTOM;
    const resizingVertically = resizeMode !== MODES.LEFT && resizeMode !== MODES.RIGHT;

    // Capture deltas for top/left/width/height
    const targetSize = {
      ...this.sizeAtStart
    };

    // Determine horizontal deltas
    if (resizingHorizontally) {
      if ([MODES.TOP_LEFT, MODES.LEFT, MODES.BOTTOM_LEFT].indexOf(resizeMode) > -1) {
        targetSize.left += (clientX - this.startMousePosition.x) / scale;
        targetSize.width -= (clientX - this.startMousePosition.x) / scale;
      } else {
        targetSize.width += (clientX - this.startMousePosition.x) / scale;
      }
    }

    // Determine vertical deltas
    if (resizingVertically) {
      if ([MODES.TOP_LEFT, MODES.TOP, MODES.TOP_RIGHT].indexOf(resizeMode) > -1) {
        targetSize.top += (clientY - this.startMousePosition.y) / scale;
        targetSize.height -= (clientY - this.startMousePosition.y) / scale;
      } else {
        targetSize.height += (clientY - this.startMousePosition.y) / scale;
      }
    }

    this.resizeTo(e, targetSize);
  }

  resizeTo(e, rect) {
    this.props.onResize(e, this.sizeAtStart, rect, this.state.resizeMode);
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
          scale={this.props.scale}
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
