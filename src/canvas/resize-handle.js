import React, { Component, PropTypes } from "react";
import "./resize.css";

export default class ResizeHandle extends Component {
  static propTypes = {
    alignBottom: PropTypes.bool,
    alignLeft: PropTypes.bool,
    alignRight: PropTypes.bool,
    alignTop: PropTypes.bool,
    cornerBottomLeft: PropTypes.bool,
    cornerBottomRight: PropTypes.bool,
    cornerTopLeft: PropTypes.bool,
    cornerTopRight: PropTypes.bool,
    isActive: PropTypes.bool,
    mode: PropTypes.string,
    onResize: PropTypes.func
  };

  handleResize = e => {
    this.props.onResize(e, this.props.mode);
  }

  render() {
    const {
      alignTop,
      alignRight,
      alignBottom,
      alignLeft,
      cornerTopLeft,
      cornerTopRight,
      cornerBottomRight,
      cornerBottomLeft,
      isActive
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

    if (!isActive) return null;

    return (
      <div
        className={resolvedClassNames}
        onMouseDown={this.handleResize}
        onTouchStart={this.handleResize}
      />
    );
  }
}
