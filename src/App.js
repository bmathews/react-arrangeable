import React, { Component } from "react";
import CanvasElement from "./CanvasElement";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: [{
        id: 1,
        left: 100,
        top: 100,
        height: 300,
        width: 300,
        rotation: 0
      }],
      selectedIndex: 0
    };
  }

  handleResize = (newRect) => {
    const { nodes, selectedIndex } = this.state;
    const clonedNodes = JSON.parse(JSON.stringify(nodes));
    const node = clonedNodes[selectedIndex];
    node.height = newRect.height;
    node.width = newRect.width;
    node.left = newRect.left;
    node.top = newRect.top;
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
      const { id, height, left, rotation, top, width } = n;

      return (
        <div
          key={id}
          onMouseDown={this.handleMouseDown.bind(null, i)}
          className={`${isSelected ? "selected" : ""} Node`}
          style={{
            left,
            top,
            height,
            width,
            transform: `rotateZ(${rotation}deg)`
          }}
        >
          <CanvasElement
            getRect={() => n}
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
