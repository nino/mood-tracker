import React, {Component} from 'react';
import Chart from 'chart.js';

class DataDisplayGraph extends Component {
  shouldComponentUpdate(newProps) {
    return (
      newProps.metric.entries.length !== this.props.metric.entries.length
    );
  }

  renderGraph() {
    let dates = this.props.metric.entries.map(entry => new Date(entry.date));
    let thedata = this.props.metric.entries.map(entry => entry.value);
    let context = document.getElementById(this.props.metric.name + '-chart');
    new Chart(context, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          tension: 0,
          label: this.props.metric.name,
          data: thedata,
          backgroundColor: 'rgba(255, 200, 150, 0.3)',
          borderColor: 'rgba(255, 200, 150, 1)',
        }],
      },
      options: {
        scales: {
          xAxes: [{
            type: "time",
            scaleType: "date",
          }],
          yAxes: [{
            ticks: {
              beginAtZero:true,
              max: this.props.metric.maxValue,
              min: this.props.metric.minValue,
            },
          }],
        },
      },
    });
  }

  componentDidMount() {
    this.renderGraph();
  }

  componentDidUpdate() {
    this.renderGraph();
  }

  render() {
    return (
      <canvas id={this.props.metric.name + '-chart'} width={200} height={150}></canvas>
    );
  }
}

DataDisplayGraph.propTypes = {
  metric: React.PropTypes.object.isRequired,
};

export default DataDisplayGraph;
