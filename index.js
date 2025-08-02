const express = require('express');
const app = express();

app.use(express.json()); // to parse JSON request bodies

// Routes
const messageRoutes = require('./routes/message');
const crawlRoutes = require('./routes/crawl');

app.use('/message', messageRoutes);
app.use('/crawl', crawlRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
