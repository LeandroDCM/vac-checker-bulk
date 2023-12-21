/// <reference types="puppeteer" />
import puppeteer from "puppeteer";
import { parseCsvFile } from "../utils/helpers/CsvToJson";
import * as path from "path";
import express from "express";

const router = express.Router();

type EmojiResponse = unknown;

router.get<{}, EmojiResponse>("/", async (req, res) => {
  try {
    interface User {
      link: string;
      name: string;
    }

    let result: string[] = [];

    async function fileToJson(): Promise<User[]> {
      const filePath = path.join(__dirname, "users.txt");
      const usersJson = await parseCsvFile(filePath);
      return usersJson;
    }

    const targetDivClass = "profile_ban_status";
    const backupNameDivClass = "actual_persona_name";

    async function scrapeWebsite(browser: any): Promise<void> {
      const users = await fileToJson();

      // const userPromises = users.map(async (user) => {
      //   const page = await browser.newPage();
      //   let divContent: string = "";
      //   let backupName: string = "";

      //   try {
      //     await page.goto(user.link, {
      //       timeout: 10000,
      //       waitUntil: "domcontentloaded",
      //     });
      //     await page.waitForSelector(`.${targetDivClass}`, { timeout: 1000 }); // Adjust timeout as needed
      //     divContent = await page.$eval(
      //       `.${targetDivClass}`,
      //       (div: any) => div?.textContent || ""
      //     );
      //     await page.waitForSelector(`.${backupNameDivClass}`, {
      //       timeout: 1000,
      //     }); // Adjust timeout as needed
      //     backupName = await page.$eval(
      //       `.${backupNameDivClass}`,
      //       (div: any) => div?.textContent || ""
      //     );
      //   } catch (error) {
      //     divContent = "Tzl não está banido";
      //   } finally {
      //     await page.close();
      //   }

      //   if (!user.name) user.name = backupName;
      //   console.log(`Retardado: ${user.name}:`, divContent);
      //   result.push(`Retardado: ${user.name}:, ${divContent}`);
      // });

      // await Promise.all(userPromises);
    }

    (async () => {
      const browser = await puppeteer.launch({ headless: true });
      try {
        await scrapeWebsite(browser);
      } finally {
        await browser.close();
        res.json(result);
      }
    })();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: `${error}` });
  }
  res.json(["inehoff"]);
});

export default router;
