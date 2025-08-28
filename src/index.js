const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const apiRoutes = require('./routes/api');
const webRoutes = require('./routes/web');
const { botHandler } = require('./bot');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Teams Bot endpoint
app.post('/api/messages', botHandler);

app.use('/api', apiRoutes);
app.use('/', webRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'OneAsk - Your Personal Knowledge Agent',
    version: '1.0.0',
    endpoints: {
      web: `http://localhost:${PORT}`,
      api: `http://localhost:${PORT}/api`,
      teamsBot: `http://localhost:${PORT}/api/messages`
    }
  });
});

app.listen(PORT, () => {
  console.log(`OneAsk server running on port ${PORT}`);
  console.log(`Web interface: http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api`);
  console.log(`Teams Bot endpoint: http://localhost:${PORT}/api/messages`);
});
