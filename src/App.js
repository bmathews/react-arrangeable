import React, { Component } from 'react';
import CanvasElement from './CanvasElement';
import './App.css';
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
        rotation: 10
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
    let constrained = constraints.constrainWidthHeight(nextSize, 30, 30, mode);
    const results = constraints.constrainGrid(constrained, this.state.snapLines, mode);
    constrained = results.size;
    if (e.shiftKey && mode !== MODES.MOVE) {
      constrained = constraints.constrainRatio(originalSize, constrained, results.closest, mode);
    }
    constrained = constraints.constrainCanvasBounds(constrained,
                                                    CANVAS_WIDTH / this.state.scale,
                                                    CANVAS_HEIGHT / this.state.scale,
                                                    mode);

    // intermediarySize is the in-process drag/resize size
    const node = this.state.nodes[this.state.selectedIndex] ;
    this.state.nodes[this.state.selectedIndex] = {
      ...node,
      ...constrained
    };
    this.setState({ activeSnapLines: results.lines });
  }

  getSnapLines = () => {
    const rects = [];

    this.state.nodes.forEach((n, idx) => {
      if (idx === this.state.selectedIndex) return;
      rects.push(n);
    });

    const lines = constraints.rectToSnapLines({
      top: 0,
      left: 0,
      width: CANVAS_WIDTH / this.state.scale,
      height: CANVAS_HEIGHT / this.state.scale
    });

    return lines.concat(constraints.rectsToSnapLines(rects));
  }

  handleResize = (e, originalSize, nextSize, mode) => {
    this.runConstraints(e, originalSize, nextSize, mode);
  }

  handleResizeStart = () => {
    this.setState({ isResizing: true, snapLines: this.getSnapLines(), activeSnapLines: [] });
  }

  handleResizeStop = () => {
    this.setState({ isResizing: false, activeSnapLines: [] });
  }

  handleDrag = (e, originalSize, nextSize, mode) => {
    this.runConstraints(e, originalSize, nextSize, mode);
  }

  handleDragStart = () => {
    this.setState({ isDragging: true, snapLines: this.getSnapLines(), activeSnapLines: [] });
  }

  handleDragStop = () => {
    this.setState({ isDragging: false, activeSnapLines: [] });
  }

  handleMouseDown = (i, e) => {
    e.stopPropagation();
    this.setState({ selectedIndex: i })
  }

  handleBlur = (e) => {
    this.setState({ selectedIndex: null })
  }

  renderSnapLine = (line, idx) => {
    const width = line[1] === 0 ? CANVAS_WIDTH : 1;
    const height = line[1] === 1 ? CANVAS_HEIGHT : 1;
    const top = line[1] === 0 ? line[0] : 0;
    const left = line[1] === 1 ? line[0] : 0;
    return (
      <div key={idx} style={{width, height, top, left, backgroundColor: 'rgba(33,150,243,.2)', position: 'absolute'}} />
    );
  }

  renderNodes = () => {
    return this.state.nodes.map((n, i) => {
      const isSelected = this.state.selectedIndex === i;

      return (
        <div
          key={n.id}
          onMouseDown={this.handleMouseDown.bind(null, i)}
          className={`${isSelected ? 'selected' : ''} Node`}
          style={{ top: n.top, left: n.left, width: n.width, height: n.height, transform: `rotateZ(${n.rotation}deg)` }}
        >
          <CanvasElement
            getSize={() => n}
            ref={(el) => { this.elementRefs[n.id] = el; }}
            elementIndex={i}
            scale={this.state.scale}
            onResize={this.handleResize}
            onResizeStart={this.handleResizeStart}
            onResizeStop={this.handleResizeStop}
            onDrag={this.handleDrag}
            onDragStart={this.handleDragStart}
            onDragStop={this.handleDragStop}
            isSelected={isSelected}
            isResizing={isSelected && this.state.isResizing}
            isDragging={isSelected && this.state.isDragging}
            resizeHorizontal={isSelected && !this.state.isDragging}
            resizeVertical={isSelected && !this.state.isDragging}
            canArrange={isSelected && !this.state.isResizing && !this.state.isDragging}
            draggable
          >

          </CanvasElement>
        </div>
      );
    })
  }

  render() {
    return (
      <div className="App" onMouseDown={this.handleBlur} onTouchStart={this.handleBlur}>
        { this.renderNodes() }
        { this.state.activeSnapLines.map(this.renderSnapLine) }
      </div>
    );
  }
}

export default App;
