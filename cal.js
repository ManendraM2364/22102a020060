 
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;

const VALID_TYPES = {
  p: "primes",
  f: "fibo",
  e: "even",
  r: "rand"
};

const BASE_URL = "http://20.244.56.144/evaluation-service";

const windows = {
  p: [],
  f: [],
  e: [],
  r: []
};
const AUTH_TOKEN = "Bearer grVjcPNuBkeAKRQN"; // Replace with your actual token

async function fetchNumbers(type) {
  try {
    const url = `${BASE_URL}/${VALID_TYPES[type]}`;
    console.log("Fetching from:", url);

    const response = await axios.get(url, {
      timeout: 500,
      headers: {
        Authorization: AUTH_TOKEN
      }
    });

    console.log("Received response:", response.data);
    return response.data.numbers || [];
  } catch (error) {
    console.error("Fetch error:", error.message);
    return [];
  }
}

app.get("/numbers/:type", async (req, res) => {
  const type = req.params.type;

  if (!VALID_TYPES[type]) {
    return res.status(400).json({ error: "Invalid type. Use p, f, e, or r." });
  }

  const prevWindow = [...windows[type]];
  const fetchedNumbers = await fetchNumbers(type);

  for (const num of fetchedNumbers) {
    if (!windows[type].includes(num)) {
      windows[type].push(num);
      if (windows[type].length > WINDOW_SIZE) {
        windows[type].shift(); 
      }
    }
  }

  const currWindow = [...windows[type]];

  const avg = currWindow.length
    ? parseFloat((currWindow.reduce((a, b) => a + b, 0) / currWindow.length).toFixed(2))
    : 0.0;

  res.json({
    windowPrevState: prevWindow,
    windowCurrState: currWindow,
    numbers: fetchedNumbers,
    avg: avg
  });
});
app.get("/", (req, res) => {
  res.send("Welcome to Average Calculator Microservice! Use /numbers/{p|f|e|r}");
});

app.listen(PORT, () => {
  console.log(`Average Calculator Microservice running on http://localhost:${PORT}`);
});

