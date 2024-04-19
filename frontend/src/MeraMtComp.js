import React, { useState, useEffect } from 'react';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend, TimeScale } from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import annotationPlugin from 'chartjs-plugin-annotation';
import { fetchMeraNetwSensHist } from './apiService';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  TimeScale,
  annotationPlugin);

  const options = {
    responsive: true,
    scales: {
      x: {
        type: 'time',
        time: {
          parser: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSSSS\'Z\'',
          unit: 'day',
          displayFormats: {
            day: 'MMM dd, yyyy'
          }
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      'y-normal': {
        id: 'y-normal',
        beginAtZero: true,
        suggestedMax: 100,
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Value (0-100)'
        },
      },
      'y-high': {
        id: 'y-high',
        beginAtZero: true,
        suggestedMax: 3000,
        type: 'linear',
        position: 'right', 
        title: {
          display: true,
          text: 'Value (100+)'
        },

      }
    }
  };

const processData = (data, deviceName) => {
  const labels = data.map(item => new Date(item.ts));
  const datasets = [
    {
      yAxisID: 'y-normal',
      label: `CO2 Levels for ${deviceName}`,
      data: data.map(item => item.co2?.concentration),
      borderColor: '#d82626',
      tension: 0.1,

    },
    {
      yAxisID: 'y-normal',
      label: `Humidity (%) for ${deviceName}`,
      data: data.map(item => item.humidity?.relativePercentage),
      borderColor: '#d8d826',
      tension: 0.1,
    },
    {
      yAxisID: 'y-normal',
      label: `Noise Level for ${deviceName}`,
      data: data.map(item => item.noise?.ambient?.level),
      borderColor: '#26d826',
      tension: 0.1,

    },
    {
      yAxisID: 'y-normal',
      label: `PM2.5 Concentration for ${deviceName}`,
      data: data.map(item => item.pm25?.concentration),
      borderColor: '#26d8d8',
      tension: 0.1,

    },
    {
      yAxisID: 'y-normal',
      label: `Temperature (F) for ${deviceName}`,
      data: data.map(item => item.temperature?.fahrenheit),
      borderColor: '#2626d8',
      tension: 0.1,

    },
    {
      yAxisID: 'y-high',
      label: `TVOC Levels for ${deviceName}`,
      data: data.map(item => item.tvoc?.concentration),
      borderColor: '#d826d8',
      tension: 0.1,

    }
  ];
  console.log("Processed Data: ", { labels, datasets });
  console.log("Chart Options: ", options);
  return { labels, datasets };
};

const MeraMtComp = ({ devices, orgId }) => {
  const [graphsData, setGraphsData] = useState([]);

  useEffect(() => {
    
    const fetchAndProcessData = async () => {
      setGraphsData([]);
      
      for (const device of devices) {
        let combinedData = {};
        const metrics = ['tvoc', 'co2', 'humidity', 'noise', 'pm25', 'temperature'];
        for (const metric of metrics) {
          try {
            const data = await fetchMeraNetwSensHist(orgId, 86400, [device.serial], metric);
            data.forEach(item => {
              const ts = item.ts;
              if (!combinedData[ts]) {
                combinedData[ts] = { ts };
              }
              combinedData[ts][metric] = item[metric];
            });
          } catch (error) {
            console.error(`Failed to fetch and process sensor history for ${metric}`, error);
          }
        }

        const processedData = processData(Object.values(combinedData), device.name);
        setGraphsData(prevData => [...prevData, { label: device.name, data: processedData }]);
      }
    };

    if (devices.length > 0) {
      fetchAndProcessData();
    }
  }, [devices, orgId]);
  

  return (
    <div>
      {graphsData.map((chartData, index) => (
        <div key={index}>
          <h2>{chartData.label}</h2>
          <Line options={options} data={chartData.data} />
        </div>
      ))}
    </div>
  );
};

export default MeraMtComp;