import axios from "axios";
import * as cheerio from "cheerio";
import * as path from "path";
import express from "express";
import { parseCsvFile } from "../utils/helpers/CsvToJson";

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

    async function scrapeWebsite(user: User): Promise<void> {
      try {
        const response = await axios.get(user.link);
        const $ = cheerio.load(response.data);

        // Adjust the selector based on the structure of the target website
        let divContent = $(`.${targetDivClass}`).text();
        let divContentName = $(`.${backupNameDivClass}`).text();

        if (!user.name) user.name = divContentName;

        if (!divContent) divContent = "Livre";
        else {
          divContent = "VAC";
        }

        console.log(`Retardado: ${user.name}:`, divContent);
        result.push(`Retardado: ${user.name}: ${divContent}`);
      } catch (error: any) {
        console.error(`Error scraping ${user.name}'s page:`, error.message);
        // Handle the error as needed
      }
    }

    const users = await fileToJson();
    const scrapePromises = users.map(scrapeWebsite);

    await Promise.all(scrapePromises);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `${error}` });
  }
});

export default router;
