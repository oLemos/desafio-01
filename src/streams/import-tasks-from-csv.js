import fs from "node:fs";

import { parse } from "csv-parse";

const csvPath = new URL("./test-sheet.csv", import.meta.url);

export async function importTasksFromCSV() {
	const fileStream = fs.createReadStream(csvPath);

	const parser = fileStream.pipe(
		parse({
			columns: true,
			skipLines: 1,
			delimiter: ",",
			skip_empty_lines: true,
		})
	);

	for await (const task of parser) {
		const { title, description } = task;

		await fetch("http://localhost:3333/tasks", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ title, description }),
		})
			.then(() => console.log(`Task "${title}" imported successfully.`))
			.catch((error) => {
				console.error(error);
				throw new Error("Failed to import tasks");
			});
	}
}
