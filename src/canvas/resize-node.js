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
    onResize: PropTypes.func,
    onRotate: PropTypes.func
  };

  renderCornerIcon = (props) => {
    const { cornerTopLeft, cornerTopRight, cornerBottomRight, cornerBottomLeft } = props;
    if (!cornerTopLeft && !cornerTopRight && !cornerBottomRight && !cornerBottomLeft) return;

    const iconClassNames = [
      cornerTopLeft && "iconTopLeft",
      cornerTopRight && "iconTopRight",
      cornerBottomLeft && "iconBottomLeft",
      cornerBottomRight && "iconBottomRight"
    ].join(" ");

    return <span className={iconClassNames} />;
  }

  handleResize = e => {
    this.props.onResize(e, this.props.mode);
  }

  handleRotate = e => {
    this.props.onRotate(e, this.props.mode);
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
        onMouseDown={this.handleRotate}
        onTouchStart={this.handleRotate}
        style={{ backgroundColor: "rgba(77, 189, 51, 0.5)", padding: 16 }}
      >
        <div
          className="resizeNode"
          onMouseDown={this.handleResize}
          onTouchStart={this.handleResize}
        />
      </div>
    );
  }
}
