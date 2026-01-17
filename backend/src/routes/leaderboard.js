import express from 'express';
import { users } from '../models/data.js';

const router = express.Router();

router.get('/', (req, res) => {
  const leaderboard = Array.from(users.values()).map((u, i) => ({
    rank: i + 1,
    username: u.username,
    totalScore: u.totalScore
  }));

  res.json({ leaderboard });
});

export default router;
