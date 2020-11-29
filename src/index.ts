import type { IssuesGetResponseData } from "@octokit/types";
import { Application } from "probot";
import { Config, schema } from "./schema";

export = ({ app }: { app: Application }) => {
  app.on("issues.labeled", async (context) => {
    const issue = context.issue();
    const octokit = context.octokit;

    const configYaml = context.config("contemplate.yml");

    const { value, error } = schema.validate(configYaml);

    if (error !== undefined) {
      context.octokit.log.error(error.message);
      return;
    }

    const config = value as Config;

    async function closeIssue() {
      await octokit.issues.update(context.issue({ state: "closed" }));
    }

    async function getAuthor(): Promise<IssuesGetResponseData["user"]> {
      return (await octokit.issues.get(issue)).data.user;
    }

    async function handleViolation(commentBody: string) {
      await closeIssue();

      const author = await getAuthor();
      commentBody = commentBody.replace("{{authorLogin}}", author.login);

      const { owner, repo } = context.repo();
      const templateChooserLink = `https://github.com/${owner}/${repo}/issues/new/choose`;

      commentBody = commentBody.replace(
        "{{templateChooserLink}}",
        templateChooserLink
      );

      const comment = context.issue({ body: commentBody });

      await octokit.issues.createComment(comment);
    }

    switch (context.payload.label?.name) {
      case config.doesntFollowTemplateLabel:
        await handleViolation(config.doesntFollowTemplateCommentBody);
        break;

      case config.templateIgnoredLabel:
        await handleViolation(config.templateIgnoredCommentBody);
        break;
    }
  });
};
