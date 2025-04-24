const puppeteer = require("puppeteer");
const express = require("express");
const app = express();

app.get("/search", async (req, res) => {
  const {
    location = "potchefstroom",
    bedrooms = "2",
    price = "800000",
    type = "buy" // default to 'buy' if not specified
  } = req.query;

  const basePath = type === "rent" ? "to-rent" : "for-sale";
  const url = `https://www.property24.com/${basePath}/${location.toLowerCase()}/north-west/1?bedrooms=${bedrooms}&price-to=${price}`;

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

  const properties = await page.evaluate(() => {
    const cards = document.querySelectorAll(".p24_content .p24_listingTile");
    const results = [];

    cards.forEach((card) => {
      const title = card.querySelector(".p24_title")?.innerText || "";
      const price = card.querySelector(".p24_price")?.innerText || "";
      const link = card.querySelector("a")?.href || "";
      const image = card.querySelector("img")?.src || "";

      results.push({ title, price, link, image });
    });

    return results.slice(0, 3);
  });

  await browser.close();
  res.json(properties);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Scraper running on port ${PORT}`));

