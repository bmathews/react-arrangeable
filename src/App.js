import React, { Component } from "react";
import CanvasElement from "./CanvasElement";
import "./App.css";
import * as constraints from "./canvas/constraints";
import MODES from "./canvas/modes";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

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
      selectedIndex: 0,
      snapLines: [],
      activeSnapLines: [],
      scale: 1
    };

    this.elementRefs = {};
  }

  runConstraints = (e, originalSize, nextSize, mode) => {
    const { nodes, scale, selectedIndex, snapLines } = this.state;
    let constrained = constraints.constrainWidthHeight(nextSize, 30, 30, mode);
    const results = constraints.constrainGrid(constrained, snapLines, mode);
    constrained = results.size;

    if (e.shiftKey && mode !== MODES.MOVE) {
      constrained = constraints.constrainRatio(originalSize, constrained, results.closest, mode);
    }

    constrained = constraints.constrainCanvasBounds(
      constrained,
      CANVAS_WIDTH / scale,
      CANVAS_HEIGHT / scale,
      mode
    );

    const clonedNodes = JSON.parse(JSON.stringify(nodes));
    const node = clonedNodes[selectedIndex];
    clonedNodes[selectedIndex] = { ...node, ...constrained };

    this.setState({
      activeSnapLines: results.lines,
      nodes: clonedNodes
    });
  }

  getSnapLines = () => {
    const { nodes, selectedIndex, scale } = this.state;
    const rects = [];

    nodes.forEach((n, i) => {
      if (i === selectedIndex) return;
      rects.push(constraints.getBoundingBox(n));
    });

    const lines = constraints.rectToSnapLines({
      top: 0,
      left: 0,
      width: CANVAS_WIDTH / scale,
      height: CANVAS_HEIGHT / scale
    });

    return lines.concat(constraints.rectsToSnapLines(rects));
  }

  handleResize = (e, originalSize, nextSize, mode) => {
    this.runConstraints(e, originalSize, nextSize, mode);
  }

  handleResizeStart = () => {
    this.setState({
      isResizing: true,
      snapLines: this.getSnapLines(),
      activeSnapLines: []
    });
  }

  handleResizeStop = () => {
    this.setState({
      isResizing: false,
      activeSnapLines: []
    });
  }

  handleDrag = (e, originalSize, nextSize, mode) => {
    this.runConstraints(e, originalSize, nextSize, mode);
  }

  handleDragStart = () => {
    this.setState({
      isDragging: true,
      snapLines: this.getSnapLines(),
      activeSnapLines: []
    });
  }

  handleDragStop = () => {
    this.setState({
      isDragging: false,
      activeSnapLines: []
    });
  }

  handleMouseDown = (i, e) => {
    e.stopPropagation();
    this.setState({ selectedIndex: i })
  }

  handleBlur = (e) => {
    this.setState({ selectedIndex: null })
  }

  handleRotate = (degrees) => {
    const { nodes, selectedIndex } = this.state;
    const clonedNodes = JSON.parse(JSON.stringify(nodes));
    const node = clonedNodes[selectedIndex];
    node.rotation = degrees;
    this.setState({ nodes: clonedNodes });
  }

  renderSnapLine = (line, i) => {
    const width = line[1] === 0 ? CANVAS_WIDTH : 1;
    const height = line[1] === 1 ? CANVAS_HEIGHT : 1;
    const top = line[1] === 0 ? line[0] : 0;
    const left = line[1] === 1 ? line[0] : 0;
    return (
      <div
        key={i}
        style={{
          width,
          height,
          top,
          left,
          backgroundColor: "rgba(33,150,243,.2)",
          position: "absolute"
        }}
      />
    );
  }

  renderNodes = () => {
    const { nodes, scale, selectedIndex, isResizing, isDragging } = this.state;

    return nodes.map((n, i) => {
      const isSelected = selectedIndex === i;
      const { id, width, height, rotation } = n;
      const boundingBox = constraints.getBoundingBox(n);

      return (
        <div
          key={id}
          style={Object.assign({}, boundingBox, {
            position: "absolute",
            border: isSelected ? "1px dashed #4DBD33" : "none"
          })}
        >
          <div
            onMouseDown={this.handleMouseDown.bind(null, i)}
            className={`${isSelected ? "selected" : ""} Node`}
            style={{
              height,
              left: (boundingBox.width - width) / 2,
              top: (boundingBox.height - height) / 2,
              transform: `rotateZ(${rotation * 180 / Math.PI}deg)`,
              width
            }}
          >
            <CanvasElement
              getSize={() => n}
              ref={(el) => { this.elementRefs[id] = el; }}
              elementIndex={i}
              scale={scale}
              onResize={this.handleResize}
              onResizeStart={this.handleResizeStart}
              onResizeStop={this.handleResizeStop}
              onRotate={this.handleRotate}
              onDrag={this.handleDrag}
              onDragStart={this.handleDragStart}
              onDragStop={this.handleDragStop}
              isSelected={isSelected}
              isResizing={isSelected && isResizing}
              isDragging={isSelected && isDragging}
              resizeHorizontal={isSelected && !isDragging}
              resizeVertical={isSelected && !isDragging}
              canArrange={isSelected && !isResizing && !isDragging}
              draggable
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
        {this.state.activeSnapLines.map(this.renderSnapLine)}
      </div>
    );
  }
}

export default App;
