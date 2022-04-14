import "dotenv/config";
import express from "express";
import * as path from "path";
import { fileURLToPath } from "url";
import { graphql } from "@octokit/graphql";
import { runInNewContext } from "vm";

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

app
	.use(express.static(__dirname + "/public"))
	.use(express.static("./public"))
	.use(express.urlencoded());

app.listen(3000, () => {
	console.log(`listening to port ${port}`);
});

app.get("/", (req, res) => {
	res.render("index");
});

app.post("/create-portfolio", (req, res) => {
	const username = req.body.username;
	res.redirect(`/portfolio?user=${username}`);
});

app.get("/portfolio", (req, res) => {
	graphqlAuth(`{
        user(login: "${req.query.user}") {
            login
            repositories(first: ${
							req.query.page * 3 || 3
						}, orderBy: {field: PUSHED_AT, direction: DESC}) {
                edges {
                    node {
                        name
                        url
                        description
                        forkCount
                        stargazerCount
                        languages(first: 10) {
                            nodes {
                                name
                                color
                            }
                        }
                    }
                }
            }
        }
    }`).then((data) => {
		const page = parseInt(req.query.page) + 1;
		res.render("portfolio", {
			user: data.user.login,
			data: data.user.repositories.edges,
			page: page ? page : 2,
		});
	});
});
