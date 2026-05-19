const express = require("express");
const cors = require("cors");
const { evaluatePrompt } = require("./trainer");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/train", async (req, res) => {
  const { challenge, userPrompt } = req.body;

  if (!challenge || !userPrompt) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const result = await evaluatePrompt(challenge, userPrompt);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Evaluation failed" });
  }
});

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
