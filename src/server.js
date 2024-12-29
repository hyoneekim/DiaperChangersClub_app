const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = 3001;

app.use(cors());

app.use(express.json({ limit: '10kb' })); // Adjust limits appropriately
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(express.static(path.join(__dirname, '../public')));


// API 엔드포인트
app.get('/api/markers', async (req, res) => {
  try {
    const response = await axios.post('https://eu-central-1.aws.data.mongodb-api.com/app/data-kvzdxoj/endpoint/data/v1/action/find', {
      "collection": "places",
      "database": "diaper",
      "dataSource": "Cluster0",
      "projection": {
        "_id": 1,
        "lat": 1,
        "lng": 1,
        "lo_name": 1,
        "info":1,
        "place._id": 1,
        "place.name": 1,
        "place.type": 1,
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'api-key': 'bWOTFZ3KiTnXeSSNsMj8qDbqv55tNzv9iJiqk9TKgZ7ZfSjiujRIdbsbyuSbG65o',
      }
    });

    res.json(response.data.documents);
  } catch (error) {
    console.error('Error fetching data from API:', error);
    res.status(500).json({ message: 'Failed to fetch data from API' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
