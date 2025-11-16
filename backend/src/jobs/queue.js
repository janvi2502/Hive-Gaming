const { Queue } = require('bullmq');
const Redis = require('ioredis');
require('dotenv').config();

const connection = new Redis(process.env.REDIS_URL);

const notificationQueue = new Queue('notifications', { connection });

module.exports = { notificationQueue, connection };
