import { Octokit } from "@octokit/rest";
import { getAuth, getForm, getFormattedResponses } from "./forms";
import { generateMarkdownFromResponses } from "./markdown";
import { format } from "date-fns";
import { Auth } from "googleapis";
import { Base64 } from "js-base64";

export async function uploadIssue({
  auth,
  formId,
  issueNo,
}: {
  auth: Auth.GoogleAuth;
  formId: string;
  issueNo: number;
}) {
  const form = await getForm({ auth, formId });
  const responses = await getFormattedResponses({ auth, form });
  if (!responses) {
    throw new Error(`No responses to issue #${issueNo}: ${formId}`);
  }
  const dateStr = format(new Date(), "yyyy-MM-dd");
  const content = generateMarkdownFromResponses({
    responses,
    issueNumber: issueNo,
    dateStr,
  });
  const fileName = `9loop-no${issueNo.toString().padStart(3, "0")}`;
  const message = `Create 9loop newsletter issue no. ${issueNo}`;
  return uploadFile({
    owner: "lolpre",
    repo: "9bot",
    path: `9loop/source/_posts/${fileName}.md`,
    content: Base64.encode(content), // cant use btoa because of emojis
    message,
    author: {
      name: `9bot`,
      email: "9bot@gmail.com",
    },
  });
}

async function uploadFile({
  owner,
  repo,
  path,
  content,
  message,
  author,
}: {
  owner: string;
  repo: string;
  path: string;
  content: string;
  message: string;
  author?: {
    name: string;
    email: string;
  };
}) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const result = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content,
    author,
    committer: author,
  });

  return result;
}

if (module === require.main) {
  const auth = getAuth();
  uploadIssue({
    auth,
    formId: "1YNRxlyDm5j3jjIBe9ZECZ2f3Btd9rXjAqWeC4ceRzis",
    issueNo: 0,
  })
    .then(console.log)
    .catch(console.error);
}
