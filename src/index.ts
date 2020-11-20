import { Application } from "probot"; // eslint-disable-line no-unused-vars
import { IssuesGetResponseData } from "@octokit/types";

export = (app: Application) => {
  app.on("issues.labeled", async ({ octokit, ...context }) => {
    const issue = context.issue();

    async function closeIssue() {
      await octokit.issues.update(context.issue({ state: "closed" }));
    }

    async function getAuthor(): Promise<IssuesGetResponseData["user"]> {
      return (await octokit.issues.get(issue)).data.user;
    }

    const issueLabels = (await octokit.issues.listLabelsOnIssue(issue)).data;

    const issueLabelNames = issueLabels.map((label) => label.name);

    if (issueLabelNames.includes("doesn't-follow-template")) {
      await closeIssue();

      const author = await getAuthor();

      const issueComment = context.issue({
        body: `Hi @${author.login}! Thank you for opening an issue! Unfortunately, it looks like you haven't followed the template or read its instructions carefully. Please read the template again and do what it says; it will ensure both you and team members have a far easier time discussing the issue!`,
      });

      await octokit.issues.createComment(issueComment);
    } else if (issueLabelNames.includes("template-ignored")) {
      await closeIssue();

      const author = await getAuthor();

      const issueComment = context.issue({
        body: `Hi @${author.login}. Thank you for opening an issue! Please edit your issue and follow the template provided here [TODO] and a team member will get in touch with you.`,
      });

      await octokit.issues.createComment(issueComment);
    }
  });
};
