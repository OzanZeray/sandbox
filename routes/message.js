import express from 'express';
const router = express.Router();

router.post('/', (req, res) => {
  const { name } = req.body;
  const userName = name || 'stranger';
  res.json({ message: `Hello, ${userName}! This is your message from the backend.` });
});

export default router;