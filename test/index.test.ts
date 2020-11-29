import fs from "fs";
import nock from "nock";
import path from "path";
import { Probot, ProbotOctokit } from "probot";
import myProbotApp from "../src";
import doesntFollowTemplateIssuePayload from "./fixtures/doesnt-follow-template/issue.contents.json";
import templateIgnoredIssuePayload from "./fixtures/template-ignored/issue.contents.json";
import doesntFollowTemplateLabeledPayload from "./fixtures/doesnt-follow-template/issue.labeled.json";
import templateIgnoredLabeledPayload from "./fixtures/template-ignored/issue.labeled.json";

const privateKey = fs.readFileSync(
  path.join(__dirname, "fixtures/mock-cert.pem"),
  "utf-8"
);

describe("My Probot app", () => {
  let probot: any;

  beforeEach(() => {
    nock.disableNetConnect();
    probot = new Probot({
      id: 123,
      privateKey,
      githubToken: "test",
      // disable request throttling and retries for testing
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false },
      }),
    });
    // Load our app into probot
    probot.load(myProbotApp);
  });

  test("creates a comment when an issue is labeled with template-ignored", async (done) => {
    const mock = nock("https://api.github.com")
      // Test that we correctly return a test token
      .get("/repos/mhmdanas/contemplate-bot/contents/.github%2Fcontemplate.yml")
      .reply(404)
      .get("/repos/mhmdanas/.github/contents/.github%2Fcontemplate.yml")
      .reply(404)
      .post("/app/installations/2/access_tokens")
      .reply(200, {
        token: "test",
        permissions: {
          issues: "write",
        },
      })
      .patch("/repos/mhmdanas/contemplate-bot/issues/1", (body: any) => {
        expect(body).toMatchObject({ state: "closed" });
        return true;
      })
      .reply(200)
      .get("/repos/mhmdanas/contemplate-bot/issues/1")
      .reply(200, templateIgnoredIssuePayload)
      .post(
        "/repos/mhmdanas/contemplate-bot/issues/1/comments",
        (body: any) => {
          done(
            expect(body).toMatchObject({
              body:
                "Hi @mhmdanas! Thank you for opening an issue! Unfortunately, it looks like you either removed the template or haven't followed or read its instructions carefully. Please [open a new issue](https://github.com/mhmdanas/contemplate-bot/issues/new/choose) where you keep the template intact and read and follow its instructions carefully; it will ensure both you and team members have a far easier time discussing the issue!",
            })
          );
          return true;
        }
      )
      .reply(200);

    // Receive a webhook event
    await probot.receive({
      name: "issues",
      payload: templateIgnoredLabeledPayload,
    });

    expect(mock.pendingMocks()).toStrictEqual([]);
  });

  test("creates a comment when an issue is labeled with doesn't-follow-template", async (done) => {
    const mock = nock("https://api.github.com")
      // Test that we correctly return a test token
      .get("/repos/mhmdanas/contemplate-bot/contents/.github%2Fcontemplate.yml")
      .reply(404)
      .get("/repos/mhmdanas/.github/contents/.github%2Fcontemplate.yml")
      .reply(404)
      .post("/app/installations/2/access_tokens")
      .reply(200, {
        token: "test",
        permissions: {
          issues: "write",
        },
      })
      .patch("/repos/mhmdanas/contemplate-bot/issues/1", (body: any) => {
        expect(body).toMatchObject({ state: "closed" });
        return true;
      })
      .reply(200)
      .get("/repos/mhmdanas/contemplate-bot/issues/1")
      .reply(200, doesntFollowTemplateIssuePayload)
      .post(
        "/repos/mhmdanas/contemplate-bot/issues/1/comments",
        (body: any) => {
          done(
            expect(body).toMatchObject({
              body:
                "Hi @mhmdanas! Thank you for opening an issue! Please open a new issue that follows the template from [here](https://github.com/mhmdanas/contemplate-bot/issues/new/choose) and a team member will get in touch with you.",
            })
          );
          return true;
        }
      )
      .reply(200);

    // Receive a webhook event
    await probot.receive({
      name: "issues",
      payload: doesntFollowTemplateLabeledPayload,
    });

    expect(mock.pendingMocks()).toStrictEqual([]);
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about using TypeScript in your tests, Jest recommends:
// https://github.com/kulshekhar/ts-jest

// For more information about testing with Nock see:
// https://github.com/nock/nock
