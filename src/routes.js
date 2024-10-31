import { randomUUID } from "node:crypto";

import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";
import { importTasksFromCSV } from "./streams/import-tasks-from-csv.js";

const database = new Database();

export const routes = [
	{
		method: "GET",
		path: buildRoutePath("/tasks"),
		handler: (req, res) => {
			const { search } = req.query;

			const formattedSearchParams = search ? { title: search } : null;

			const tasks = database.select("tasks", formattedSearchParams);

			return res.end(JSON.stringify(tasks));
		},
	},
	{
		method: "POST",
		path: buildRoutePath("/tasks"),
		handler: (req, res) => {
			const { title, description } = req.body;

			if (!title) {
				return res
					.writeHead(400)
					.end(JSON.stringify({ message: "Title is required" }));
			}

			if (!description) {
				return res
					.writeHead(400)
					.end(
						JSON.stringify({ message: "Description is required" })
					);
			}

			const taskCreationTime = new Date().toLocaleString();

			const body = {
				id: randomUUID(),
				title,
				description: description,
				created_at: taskCreationTime,
				updated_at: taskCreationTime,
				completed_at: null,
			};

			database.insert("tasks", body);

			return res.writeHead(201).end(
				JSON.stringify({
					message: `Task "${title}" created successfully`,
				})
			);
		},
	},
	{
		method: "POST",
		path: buildRoutePath("/tasks/csv"),
		handler: (_, res) => {
			importTasksFromCSV();

			return res.end();
		},
	},
	{
		method: "DELETE",
		path: buildRoutePath("/tasks/:id"),
		handler: (req, res) => {
			const { id } = req.params;

			const selectedTask = database.select("tasks", { id });

			if (selectedTask.length === 0) {
				return res
					.writeHead(404)
					.end(JSON.stringify({ message: "Task not found" }));
			}

			database.delete("tasks", id);

			return res.end();
		},
	},
	{
		method: "PUT",
		path: buildRoutePath("/tasks/:id"),
		handler: (req, res) => {
			const { id } = req.params;

			const selectedTask = database.select("tasks", { id });

			if (selectedTask.length === 0) {
				return res
					.writeHead(404)
					.end(JSON.stringify({ message: "Task not found" }));
			}

			const body = {
				...req.body,
				updated_at: new Date().toLocaleString(),
			};

			database.update("tasks", id, body);

			return res.end();
		},
	},
	{
		method: "PATCH",
		path: buildRoutePath("/tasks/:id/complete"),
		handler: (req, res) => {
			const { id } = req.params;

			const selectedTask = database.select("tasks", { id });

			if (selectedTask.length === 0) {
				return res
					.writeHead(404)
					.end(JSON.stringify({ message: "Task not found" }));
			}

			const body = {
				...req.body,
				updated_at: new Date().toLocaleString(),
				completed_at: new Date().toLocaleString(),
			};

			database.update("tasks", id, body);

			return res.end();
		},
	},
];
