import React, { Component, PropTypes } from "react";
import "./resize-node.css";

export default class ResizeNode extends Component {
  static propTypes = {
    activeMode: PropTypes.string,
    alignBottom: PropTypes.bool,
    alignLeft: PropTypes.bool,
    alignRight: PropTypes.bool,
    alignTop: PropTypes.bool,
    cornerBottomLeft: PropTypes.bool,
    cornerBottomRight: PropTypes.bool,
    cornerTopLeft: PropTypes.bool,
    cornerTopRight: PropTypes.bool,
    mode: PropTypes.string,
    onResize: PropTypes.func
  };

  handleResize = e => {
    this.props.onResize(e, this.props.mode);
  }

  render() {
    const {
      activeMode,
      alignTop,
      alignRight,
      alignBottom,
      alignLeft,
      cornerTopLeft,
      cornerTopRight,
      cornerBottomRight,
      cornerBottomLeft,
      mode
    } = this.props;

    const resolvedClassNames = [
      "handle",
      alignTop && "handleTop",
      alignBottom && "handleBottom",
      alignLeft && "handleLeft",
      alignRight && "handleRight",
      cornerTopLeft && "cornerTopLeft",
      cornerTopRight && "cornerTopRight",
      cornerBottomLeft && "cornerBottomLeft",
      cornerBottomRight && "cornerBottomRight"
    ].join(" ");

    if (activeMode && activeMode !== mode) return null;

    return (
      <div
        className={resolvedClassNames}
        onMouseDown={this.handleResize}
        onTouchStart={this.handleResize}
      />
    );
  }
}
