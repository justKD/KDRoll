import { Chart } from 'chart.js';
import { KDRoll } from './KDRoll';

const maxHistory: number = 3300;

const makeChart = (label: string, elem: string, color: string, data: any[]) => {
  const ctx = (elem: string): CanvasRenderingContext2D => {
    const node = document.getElementById(elem) as HTMLCanvasElement;
    return node.getContext('2d') as CanvasRenderingContext2D;
  };

  new Chart(ctx(elem), {
    type: 'line',
    data: {
      labels: new Array(maxHistory),
      datasets: [
        {
          label: label,
          backgroundColor: color,
          borderColor: color,
          data: data,
        },
      ],
    },
    options: {
      scales: {
        xAxes: [
          {
            display: false,
          },
        ],
      },
    },
  });
};

const charts: {
  func: string;
  arg: any;
  title: string;
  node: string;
  color: string;
}[] = [
  {
    func: 'uniform',
    arg: undefined,
    title: 'Mersenne Twister (Uniform Distribution)',
    node: 'uniform',
    color: 'rgb(255, 107, 107)',
  },
  {
    func: 'd',
    arg: 20,
    title: 'd20 (Uniform Distribution)',
    node: 'd20',
    color: 'rgb(72, 219, 251)',
  },
  {
    func: 'gaussian',
    arg: 0,
    title: 'Box Mueller (Gaussian Distribution)',
    node: 'gaussian',
    color: 'rgb(29, 209, 161)',
  },
  {
    func: 'gaussian',
    arg: -0.8,
    title: 'Gaussian Skew Right',
    node: 'gaussian-skew',
    color: 'rgb(254, 202, 87)',
  },
];

const roll = new KDRoll();
roll.maxHistory(maxHistory);

charts.forEach((chart) => {
  let i = maxHistory;
  const sort = (a: number, b: number) => a - b;
  const { func, arg, title, node, color } = chart;
  while (i--) (roll as any)[func](arg);
  makeChart(title, node, color, roll.history().sort(sort));
  roll.clearHistory();
});
