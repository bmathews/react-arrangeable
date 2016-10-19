import React, { Component } from "react";
import CanvasElement from "./CanvasElement";
import "./App.css";

const PI = Math.PI;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: [{
        id: 1,
        left: 20,
        top: 20,
        width: 300,
        height: 300,
        rotation: 0
      }, {
        id: 2,
        left: 320,
        top: 320,
        width: 80,
        height: 80,
        rotation: 0
      }],
      selectedIndex: 0
    };

    this.elementRefs = {};
  }

  handleResize = (newRect) => {
    const { nodes, selectedIndex } = this.state;
    const clonedNodes = JSON.parse(JSON.stringify(nodes));
    const node = clonedNodes[selectedIndex];
    node.height = newRect.height;
    node.width = newRect.width;
    node.top = newRect.top;
    node.left = newRect.left;
    this.setState({ nodes: clonedNodes });
  }

  handleDrag = (newRect) => {
    const { nodes, selectedIndex } = this.state;
    const clonedNodes = JSON.parse(JSON.stringify(nodes));
    const node = clonedNodes[selectedIndex];
    node.left = newRect.left;
    node.top = newRect.top;
    this.setState({ nodes: clonedNodes });
  }

  handleMouseDown = (i, e) => {
    e.stopPropagation();
    this.setState({ selectedIndex: i })
  }

  handleBlur = (e) => {
    this.setState({ selectedIndex: null })
  }

  handleRotate = (radians) => {
    const { nodes, selectedIndex } = this.state;
    const clonedNodes = JSON.parse(JSON.stringify(nodes));
    const node = clonedNodes[selectedIndex];
    node.rotation = radians;
    this.setState({ nodes: clonedNodes });
  }

  getBoundingBox = (node) => {
    const { top, left, width, height, rotation } = node;

    let angle = Math.abs(rotation);
    if ((angle > PI * 0.5 && angle <= PI) || (angle > PI * 1.5 && angle <= PI * 2)) {
      angle = PI - angle;
    }

    const boundingBoxWidth =
      Math.round(Math.abs(Math.sin(angle) * height + Math.cos(angle) * width));
    const boundingBoxHeight =
      Math.round(Math.abs(Math.sin(angle) * width + Math.cos(angle) * height));

    return {
      height: boundingBoxHeight,
      left: left - (boundingBoxWidth - width) / 2,
      top: top - (boundingBoxHeight - height) / 2,
      width: boundingBoxWidth
    };
  }

  renderNodes = () => {
    const { nodes, selectedIndex } = this.state;

    return nodes.map((n, i) => {
      const isSelected = selectedIndex === i;
      const { id, width, height, rotation } = n;
      const boundingBox = this.getBoundingBox(n);

      return (
        <div
          key={id}
          style={Object.assign({}, boundingBox, {
            position: "absolute",
            border: isSelected ? "1px dashed red" : "none"
          })}
        >
          <div
            onMouseDown={this.handleMouseDown.bind(null, i)}
            className={`${isSelected ? "selected" : ""} Node`}
            style={{
              height,
              left: (boundingBox.width - width) / 2,
              top: (boundingBox.height - height) / 2,
              transform: `rotateZ(${rotation * -180 / PI}deg)`,
              width
            }}
          >
            <CanvasElement
              ref={(el) => { this.elementRefs[id] = el; }}
              getRect={() => n}
              elementIndex={i}
              isSelected={isSelected}
              onDrag={this.handleDrag}
              onResize={this.handleResize}
              onRotate={this.handleRotate}
            />
          </div>
        </div>
      );
    })
  }

  render() {
    return (
      <div
        id="app"
        onMouseDown={this.handleBlur}
        onTouchStart={this.handleBlur}
      >
        {this.renderNodes()}
      </div>
    );
  }
}

export default App;
