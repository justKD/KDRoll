import './module/dev/example.charts';
import { KDRoll } from './dist/KDRoll.bundle';

const moduleExample = () => {
  const roll = new KDRoll();
  let i = 10;
  while (i--) roll.d(6);
  const stats = {
    history: roll.history(),
    mean: roll.mean(),
    median: roll.median(),
    modes: roll.modes(),
    standardDeviation: KDRoll.round(roll.standardDeviation(), 3),
  };
  console.group();
  console.log('KDRoll.esm.js loaded! Rolling a d6 10 times:');
  console.log(stats);
  console.groupEnd();
};
moduleExample();
