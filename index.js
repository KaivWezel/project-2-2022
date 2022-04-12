import "dotenv/config";
import express from "express";
import * as path from "path";
import { fileURLToPath } from "url";
import { graphql } from "@octokit/graphql";

const app = express();
const port = 3000;
const url = "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const graphqlAuth = graphql.defaults({
	headers: {
		authorization: "token " + process.env.PAT,
	},
});

app.set("view engine", "ejs").set("views", path.join(__dirname, "./views"));

app.use(express.static(__dirname + "/public")).use(express.static("./public"));

app.listen(3000, () => {
	console.log(`listening to port ${port}`);
});

app.get("/", (req, res) => {
	graphqlAuth(`{
        user(login: "kaivwezel") {
            repositories(first: 10) {
                nodes {
                    name
                }
            }
        }
    }`).then((data) => {
		res.render("index", { data: data.user.repositories.edges });
	});
});
