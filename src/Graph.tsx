import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

/**
 * Props declaration for <Graph />
 */
interface IProps {
  data: ServerRespond[],
}

/**
 * Perspective library adds load to HTMLElement prototype.
 * This interface acts as a wrapper for Typescript compiler.
 */
interface PerspectiveViewerElement extends HTMLElement { // Extend HTMLElement to enable PerspectiveViewerElement behavior
  load: (table: Table) => void,
}

/**
 * React component that renders Perspective based on data
 * parsed from its parent through data property.
 */
class Graph extends Component<IProps, {}> {
  // Perspective table
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
  // Get the first perspective-viewer element from the DOM
  const elem = document.getElementsByTagName('perspective-viewer')[0] as PerspectiveViewerElement;

  const schema = {
    stock: 'string',
    top_ask_price: 'float',
    top_bid_price: 'float',
    timestamp: 'date',
  };

  if (window.perspective && window.perspective.worker()) {
    this.table = window.perspective.worker().table(schema);
  }
  if (this.table) {
    // Load the table into the perspective-viewer DOM reference
    elem.load(this.table);

    // Set additional attributes for data visualization and aggregation
    // Set the view attribute to visualize the data as a continuous line graph (y_line)
    elem.setAttribute('view', 'y_line');
    // Set the column-pivots attribute to organize the data by stock names
    elem.setAttribute('column-pivots', '["stock"]');
    // Set the row-pivots attribute to organize the data by timestamps along the x-axis
    elem.setAttribute('row-pivots', '["timestamp"]');
    // Set the columns attribute to focus on the top ask price data along the y-axis
    elem.setAttribute('columns', '["top_ask_price"]');
    // Set the aggregates attribute to handle duplicated data and perform necessary aggregations
    // Here, we're using "distinct count" for stock and timestamp, and "avg" (average) for top_ask_price and top_bid_price
    elem.setAttribute('aggregates', '{"stock":"distinct count","top_ask_price":"avg","top_bid_price":"avg","timestamp":"distinct count"}');
  }
}


  componentDidUpdate() {
    // Everytime the data props is updated, insert the data into Perspective table
    if (this.table) {
      // As part of the task, you need to fix the way we update the data props to
      // avoid inserting duplicated entries into Perspective table again.
      this.table.update(this.props.data.map((el: any) => {
        // Format the data from ServerRespond to the schema
        return {
          stock: el.stock,
          top_ask_price: el.top_ask && el.top_ask.price || 0,
          top_bid_price: el.top_bid && el.top_bid.price || 0,
          timestamp: el.timestamp,
        };
      }));
    }
  }
}

export default Graph;
