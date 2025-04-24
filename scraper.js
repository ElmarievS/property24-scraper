const puppeteer = require("puppeteer");
const express = require("express");
const app = express();

app.get("/search", async (req, res) => {
  const { location = "durbanville", bedrooms = "3", price = "2000000" } = req.query;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  const url = `https://www.property24.com/for-sale/${location.toLowerCase()}/western-cape/1?bedrooms=${bedrooms}&price-to=${price}`;
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
