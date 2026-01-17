import express from 'express';

const router = express.Router();

router.post('/execute', (req, res) => {
  res.json({
    success: true,
    result: {
      stdout: 'Code executed (Judge0 not connected yet)'
    }
  });
});

export default router;
