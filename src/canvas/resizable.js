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

    // get mouse position
    const { x: clientX, y: clientY } = getEventCoordinates(e);

    // Determine whether we can resize horizontally and vertically
    const resizingHorizontally = this.state.resizeMode !== MODES.TOP &&
                                 this.state.resizeMode !== MODES.BOTTOM;

    const resizingVertically = this.state.resizeMode !== MODES.LEFT &&
                               this.state.resizeMode !== MODES.RIGHT;

    // Capture deltas for top/left/width/height
    const data = {
      ...this.startRect
    };

    const angle = this.startRect.rotation;

    const angle_rad = angle * Math.PI / 180;

    //patch: cache cosine & sine
    const _cos = Math.cos(angle_rad);
    const _sin = Math.sin(angle_rad)

    let dx = clientX - this.startMousePosition.x;
    let dy = clientY - this.startMousePosition.y;

    //patch: calculate the corect mouse offset for a more natural feel
    const ndx = dx * _cos + dy * _sin;
    const ndy = dy * _cos - dx * _sin;

    dx = ndx;
    dy = ndy;

    // Determine horizontal deltas
    if (resizingHorizontally) {
      if (this.state.resizeMode === MODES.TOP_LEFT || this.state.resizeMode === MODES.LEFT || this.state.resizeMode === MODES.BOTTOM_LEFT) {
        // horizontal, left side
        data.x += dx;
        data.width -= dx;
      } else {
        data.width += dx;
      }
    }

    // Determine vertical deltas
    if (resizingVertically) {
      if (this.state.resizeMode === MODES.TOP_LEFT || this.state.resizeMode === MODES.TOP || this.state.resizeMode === MODES.TOP_RIGHT) {
        // vertical, top side
        data.y += dy;
        data.height -= dy;
      } else {
        data.height += dy;
      }
    }

    //patch: difference between datas
    const diffData = {
      x: data.x - this.startRect.x,
      y: data.y - this.startRect.y,
      width: data.width - this.startRect.width,
      height: data.height - this.startRect.height,
    }

    //patch: calculate the correct position offset based on angle
    const newData = {};
    newData.x = Math.round(diffData.x * _cos - diffData.y * _sin);
    newData.y = Math.round(diffData.y * _cos + diffData.x * _sin);

    data.x = this.startRect.x;
    data.y = this.startRect.y;

    data.x += newData.x;
    data.y += newData.y;

    //patch: calculate the difference in size
    const diff_w = diffData.width;
    const diff_h = diffData.height;

    // get correction
    function getCorrection(init_w, init_h, delta_w, delta_h, angle) {
      //Convert angle from degrees to radians
      var angle = angle * Math.PI / 180

      //Get position after rotation with original size
      var x = -init_w/2;
      var y = init_h/2;
      var new_x = y * Math.sin(angle) + x * Math.cos(angle);
      var new_y = y * Math.cos(angle) - x * Math.sin(angle);
      var diff1 = {x: new_x - x, y: new_y - y};

      var new_width = init_w + delta_w;
      var new_height = init_h + delta_h;

      //Get position after rotation with new size
      var x = -new_width/2;
      var y = new_height/2;
      var new_x = y * Math.sin(angle) + x * Math.cos(angle);
      var new_y = y * Math.cos(angle) - x * Math.sin(angle);
      var diff2 = {x: new_x - x, y: new_y - y};

      //Get the difference between the two positions
      var offset = {x: diff2.x - diff1.x, y: diff2.y - diff1.y};
      return offset;
    }

    const offset = getCorrection(this.startRect.width, this.startRect.height, diff_w, diff_h, angle);

    data.x -= offset.x;
    data.y += offset.y;

    this.props.onResize(data);
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
