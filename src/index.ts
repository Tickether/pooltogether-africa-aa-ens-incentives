import express, { Express, Request, Response } from 'express'
import schedule from 'node-schedule';
import { createSmartAccount, smartUserOP } from './utils/biconomy/smartUserOP.js';

const app: Express = express();
const port = process.env.PORT || 8000;

app.get("/", (req: Request, res: Response) => {
    res.send("Express + TypeScript Server");
});

//run function once every week
// Schedule the task to run every Monday at 8:00 AM
const job = schedule.scheduleJob({ hour: 8, minute: 0, dayOfWeek: 1 }, function() {
    //calc current time stamp now
    const now = new Date().getTime();
    //calc one week ago
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    smartUserOP(BigInt(oneWeekAgo), BigInt(now));
});


app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
    createSmartAccount()
});