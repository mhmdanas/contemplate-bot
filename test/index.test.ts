// You can import your modules
// import index from '../src/index'

import nock from "nock";
// Requiring our app implementation
import myProbotApp from "../src";
import { Probot, ProbotOctokit } from "probot";
// Requiring our fixtures
import labeledPayload from "./fixtures/doesnt-follow-template/issues.labeled.json";
import openedPayload from "./fixtures/doesnt-follow-template/issues.opened.json";
import fs from "fs";
import path from "path";

const commentBody = {
  body: `Hi @mhmdanas! Thank you for opening an issue! Unfortunately, it looks like you haven't followed the template or read its instructions carefully. Please read the template again and do what it says; it will ensure both you and team members have a far easier time discussing the issue!`,
};

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

  test("creates a comment when an issue is opened", async (done) => {
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
      .reply(200, openedPayload)
      .post("/repos/mhmdanas/contemplate-bot/issues/1/comments", (body: any) => {
        done(expect(body).toMatchObject(commentBody));
        return true;
      })
      .reply(200);

    // Receive a webhook event
    await probot.receive({ name: "issues", payload: labeledPayload });

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
