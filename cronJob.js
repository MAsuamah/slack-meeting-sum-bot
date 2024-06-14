import { CronJob } from 'cron';
import { publishSummary } from './app.js';
//'0 13 * * 1'

const timeZone = 'America/New_York';

const job = new CronJob(
    '0,30 * * * 1-5',
    async () => {
      try {
        await publishSummary();
      } catch (error) {
        console.error('Error publishing summary:', error);
      }
    },
  null,
  true,
  timeZone
);

export const runCronJob = () =>{ 
    job.start();
    console.log('Cron job started.');
}



