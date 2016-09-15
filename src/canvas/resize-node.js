import React, { Component, PropTypes } from "react";
import "./resize-node.css";

export default class ResizeNode extends Component {
  static propTypes = {
    mode: PropTypes.string,
    activeMode: PropTypes.string,
    alignLeft: PropTypes.bool,
    alignTop: PropTypes.bool,
    alignBottom: PropTypes.bool,
    alignRight: PropTypes.bool,
    cornerTopLeft: PropTypes.bool,
    cornerTopRight: PropTypes.bool,
    cornerBottomLeft: PropTypes.bool,
    cornerBottomRight: PropTypes.bool,
    onResize: PropTypes.func,
    scale: PropTypes.number
  }

  renderCornerIcon(props) {
    if (
      !props.cornerTopLeft && !props.cornerTopRight &&
      !props.cornerBottomLeft && !props.cornerBottomRight
    ) {
      return;
    }

    const iconClass = [
      props.cornerTopLeft && 'iconTopLeft',
      props.cornerTopRight && 'iconTopRight',
      props.cornerBottomLeft && 'iconBottomLeft',
      props.cornerBottomRight && 'iconBottomRight'
    ].join(" ");

    return (
      <span
        className={iconClass}
        dangerouslySetInnerHTML={{ __html: '[]' }}
      >
      </span>
    );
  }

  handleResize = e => {
    this.props.onResize(e, this.props.mode);
  }

  render() {
    const resolvedClassNames = [
      'handle',
      this.props.alignTop && 'handleTop',
      this.props.alignBottom && 'handleBottom',
      this.props.alignLeft && 'handleLeft',
      this.props.alignRight && 'handleRight',
      this.props.cornerTopLeft && 'cornerTopLeft',
      this.props.cornerTopRight && 'cornerTopRight',
      this.props.cornerBottomLeft && 'cornerBottomLeft',
      this.props.cornerBottomRight && 'cornerBottomRight'
    ].join(" ");

    if (this.props.activeMode && this.props.activeMode !== this.props.mode) return null;

    return (
      <div
        style={{ transform: `scale(${1 / this.props.scale})` }}
        className={resolvedClassNames}
        onMouseDown={this.handleResize}
        onTouchStart={this.handleResize}
      >
      </div>
    );
  }
}
