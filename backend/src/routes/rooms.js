import express from 'express';
import { rooms } from '../models/data.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const problem = {
  title: 'Reverse String',
  description: 'Write a function that reverses a string.',
  difficulty: 'Easy'
};

router.post('/create', (req, res) => {
  const { name, creatorId, creatorUsername } = req.body;

  const id = uuidv4();
  const room = {
    id,
    name,
    participants: [{ userId: creatorId, username: creatorUsername, score: 0 }],
    status: 'waiting',
    problem
  };

  rooms.set(id, room);
  res.json({ success: true, room });
});

router.get('/:roomId', (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({ room });
});

export default router;
