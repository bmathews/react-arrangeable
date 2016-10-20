import React, { Component } from "react";
import CanvasElement from "./CanvasElement";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: [{
        id: 1,
        x: 200,
        y: 200,
        height: 300,
        width: 300,
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
    node.x = newRect.x;
    node.y = newRect.y;
    this.setState({ nodes: clonedNodes });
  }

  handleDrag = (newRect) => {
    const { nodes, selectedIndex } = this.state;
    const clonedNodes = JSON.parse(JSON.stringify(nodes));
    const node = clonedNodes[selectedIndex];
    node.x = newRect.x;
    node.y = newRect.y;
    this.setState({ nodes: clonedNodes });
  }

  handleMouseDown = (i, e) => {
    e.stopPropagation();
    this.setState({ selectedIndex: i });
  }

  handleBlur = (e) => {
    this.setState({ selectedIndex: null });
  }

  handleRotate = (angle) => {
    const { nodes, selectedIndex } = this.state;
    const clonedNodes = JSON.parse(JSON.stringify(nodes));
    const node = clonedNodes[selectedIndex];
    node.rotation = angle;
    this.setState({ nodes: clonedNodes });
  }

  renderNodes = () => {
    return this.state.nodes.map((n, i) => {
      const isSelected = this.state.selectedIndex === i;
      const { id, height, x, rotation, y, width } = n;

      return (
        <div
          key={id}
          id={`Node-${i}`}
          onMouseDown={this.handleMouseDown.bind(null, i)}
          className={`${isSelected ? "selected" : ""} Node`}
          style={{
            left: x,
            top: y,
            height,
            width,
            transform: `rotateZ(${rotation}deg)`
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
