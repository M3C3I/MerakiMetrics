// import React, { useState, useEffect } from 'react';
import {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import 'chartjs-adapter-date-fns';
// import {Line} from 'react-chartjs-2';
import styles from './MeraMtByIntComp.module.css';
import {fetchAllMetricsForDevices} from './apiService';
import {Line} from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  TimeScale,
} from 'chart.js';

// Register ChartJS components and plugins for use in the component.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  TimeScale,
);
ChartJS.defaults.borderColor = '#555555';
ChartJS.defaults.color = '#FFFFFF';
ChartJS.defaults.elements.line.borderWidth = 4;
ChartJS.defaults.elements.line.borderJoinStyle = 'round';
ChartJS.defaults.elements.point.pointStyle = 'rectRounded';
ChartJS.defaults.elements.point.radius = 2;
ChartJS.defaults.elements.point.hoverRadius = 1;
ChartJS.defaults.elements.point.hitRadius = 8;
ChartJS.defaults.elements.point.borderColor = '#000000';
ChartJS.defaults.elements.point.borderWidth = 0;

const optionsNormal = {
  responsive: true,
  scales: {
    x: {
      type: 'time',
      time: {
        parser: "yyyy-MM-dd'T'HH:mm:ss.SSSSSS'Z'",
        unit: 'day',
        displayFormats: {day: 'MMM dd, yyyy'},
      },
      title: {display: false, text: 'Date'},
    },
    'y-normal': {
      id: 'y-normal',
      suggestedMin: 30,
      suggestedMax: 85,
      type: 'linear',
      position: 'left',
      title: {display: true, text: 'Humidity, Noise, & Temperature'},
    },
  },
};

const optionsHigh = {
  responsive: true,
  scales: {
    x: {
      type: 'time',
      time: {
        parser: "yyyy-MM-dd'T'HH:mm:ss.SSSSSS'Z'",
        unit: 'day',
        displayFormats: {day: 'MMM dd, yyyy'},
      },
      title: {display: true, text: 'Date'},
    },
    'y-co2-pm25': {
      id: 'y-co2-pm25',
      suggestedMin: 10,
      suggestedMax: 500,
      type: 'linear',
      position: 'left',
      title: {display: true, text: 'CO2 & PM2.5'},
    },
    'y-tvoc': {
      id: 'y-tvoc',
      suggestedMin: -1000,
      suggestedMax: 4500,
      type: 'linear',
      position: 'right',
      title: {display: true, text: 'TVOC'},
    },
  },
};

const getBorderColor = metric => {
  switch (metric) {
    case 'humidity':
      return '#0088FF';
    case 'noise':
      return '#6595FF';
    case 'temperature':
      return '#0000FF';
    case 'tvoc':
      return '#0088FF';
    case 'co2':
      return '#6595FF';
    case 'pm25':
      return '#0000FF';
    default:
      return '#000000';
  }
};

// Returns a color for a given metric's value.
const getPointColor = (metric, value) => {
  const thresholds = {
    co2: [600, 800, 1500, 1800],
    humidity: [60, 70, 80, 90],
    noise: [50, 60, 70, 80],
    pm25: [23, 41, 53, 65],
    temperature: [76, 78, 80, 82],
    tvoc: [300, 1000, 3000, 10000],
  };

  const colors = ['#00FF00', '#FFFF00', '#FF8000', '#FF0000'];

  const metricThresholds = thresholds[metric];
  if (!metricThresholds) return '#000000'; // Default color if metric is unknown

  let colorIndex = metricThresholds.findIndex(threshold => value < threshold);
  if (colorIndex === -1) colorIndex = colors.length - 1;

  return colors[colorIndex];
};

// Helper function to determine the yAxisID based on the metric
function determineYAxisId(metric) {
  if (metric === 'tvoc') {
    return 'y-tvoc';
  } else if (['co2', 'pm25'].includes(metric)) {
    return 'y-co2-pm25';
  }
  return 'y-normal';
}
const concentrationMetrics = new Set(['co2', 'tvoc', 'pm25']);
const specialMappings = {
  temperature: 'fahrenheit',
  noise: 'ambient.level',
};

// Extracts and processes metric data
function processMetricData(metric, values) {
  return values.map(value => {
    if (concentrationMetrics.has(metric)) {
      return value[metric].concentration.average;
    }
    if (metric === 'noise') {
      return value.noise.ambient.level.average;
    }
    if (metric in specialMappings) {
      return value[metric][specialMappings[metric]].average;
    }
    return value[metric].relativePercentage.average;
  });
}

// Main data processing function
const processData = deviceData => {
  return deviceData.map(device => {
    // Map over each device's data and process it
    const labels = device.data.flatMap(d =>
      d.values.map(v => new Date(v.startTs)),
    );
    const datasets = device.data.map(d => {
      const metricData = processMetricData(d.metric, d.values);
      const pointColors = metricData.map(val => getPointColor(d.metric, val));
      return {
        yAxisID: determineYAxisId(d.metric),
        label: `${d.metric.toUpperCase()} Levels for ${device.deviceName}`,
        data: metricData,
        borderColor: getBorderColor(d.metric),
        pointBackgroundColor: pointColors,
        tension: 0.01,
      };
    });
    return {label: device.deviceName, labels, datasets};
  });
};
// Utility function to format a single dataset as a CSV string
function datasetToCsv(dataset) {
  return `${dataset.label},${dataset.data.join(',')}\n`;
}

// Converts chart data to a CSV format
const convertToCSV = data => {
  let csvHeader = 'data:text/csv;charset=utf-8,';
  let csvBody = data
    .map(chartData => {
      const deviceHeader = `Device: ${chartData.label}\n`;
      const timeLabels = `${chartData.labels.join(',')}\n`;
      const dataRows = chartData.datasets.map(datasetToCsv).join('');
      return `${deviceHeader}${timeLabels}${dataRows}`;
    })
    .join('\n');

  return encodeURI(`${csvHeader}${csvBody}`);
};

// Handles the download of CSV formatted chart data
const handleDownloadCSV = graphsData => {
  const csvData = convertToCSV(graphsData);
  const link = document.createElement('a');
  link.href = csvData;
  link.download = 'exported_data.csv';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
const MeraMtByIntComp = ({devices, timeFrame, orgId}) => {
  const [graphsData, setGraphsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // Ensure that timeFrame is provided before fetching
      if (!devices.length || !timeFrame) {
        return;
      }

      setIsLoading(true);
      try {
        const metrics = [
          'tvoc',
          'co2',
          'humidity',
          'noise',
          'pm25',
          'temperature',
        ];
        const data = await fetchAllMetricsForDevices(
          orgId,
          timeFrame.interval,
          timeFrame.timespan,
          devices,
          metrics,
        );
        setGraphsData(processData(data));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [timeFrame, devices, orgId]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <button
          className={styles.button}
          onClick={() => handleDownloadCSV(graphsData)}
          disabled={graphsData.length === 0}>
          Export as CSV
        </button>

        {isLoading ? (
          <h5 className={styles.loadingText}>
            Loading Data... This WILL take a while. Please wait.
          </h5>
        ) : (
          graphsData.map((data, index) => (
            <div key={index} className={styles.dataSection}>
              <h3>{data.label}</h3>
              <h6>Humidity, Noise, & Temperature</h6>
              <Line
                options={optionsNormal}
                data={{
                  labels: data.labels,
                  datasets: data.datasets.filter(d => d.yAxisID === 'y-normal'),
                }}
              />
              <h6>TVOC, CO2, & PM2.5</h6>
              <Line
                options={optionsHigh}
                data={{
                  labels: data.labels,
                  datasets: data.datasets.filter(
                    d => d.yAxisID === 'y-tvoc' || d.yAxisID === 'y-co2-pm25',
                  ),
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
MeraMtByIntComp.propTypes = {
  devices: PropTypes.array.isRequired,
  timeFrame: PropTypes.object.isRequired,
  orgId: PropTypes.string.isRequired,
};
export default MeraMtByIntComp;
