const express = require("express");
const cors = require("cors");
const m23mRouter = require("./m23m");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.use("/m23m", m23mRouter);

app.get("/health", (req, res) => res.json({ status: "BEATING", system: "M2-3M TELsTP" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`M2-3M server running on port ${PORT}`));

module.exports = app;
