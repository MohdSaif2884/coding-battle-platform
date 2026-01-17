import express from 'express';
import { users } from '../models/data.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  let user = Array.from(users.values()).find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    const id = uuidv4();
    user = {
      id,
      username,
      password,
      totalScore: 0,
      battlesWon: 0,
      battlesPlayed: 0
    };
    users.set(id, user);
  }

  res.json({ success: true, user });
});

export default router;
