/** A bunch of helper functions for interacting with google drive and forms */
import path from "path";
import { google, Auth, forms_v1, drive_v3 } from "googleapis";
import { Question, FormResponse } from "./types";
import {
  DEFAULT_QUESTIONS,
  NAME_QUESTION,
  NEW_QUESTION,
  PLACEHOLDER_QUESTION,
} from "@/defaults";

const SHARED_FOLDER_ID = "1YNN4309aT7pAtursd7G8OIrF-iQbC7_d";
const IMAGE_FOLDER_ID = "1L9xOZlo986jHJOMZTjd4fj29-rXuD0xx";
const SPREAD_SHEET_NAME = "9Bot";
const CADENCE_SHEET_NAME = "Cadence Data";

async function _getRawFormResponse({
  auth,
  formId,
}: {
  auth: Auth.GoogleAuth;
  formId: string;
}): Promise<forms_v1.Schema$ListFormResponsesResponse> {
  const forms = google.forms({ version: "v1", auth });
  const response = await forms.forms.responses.list({ formId });
  return response.data;
}

export function getAuth() {
  return new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, "../../credentials.json"),
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
}

export async function countGoogleForms({ auth }: { auth: Auth.GoogleAuth }) {
  const drive = google.drive({ version: "v3", auth });
  let nextPageToken = undefined;
  let count = 0;

  do {
    try {
      const response = (await drive.files.list({
        q: `'${SHARED_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.form' and trashed=false`,
        spaces: "drive",
        fields: "nextPageToken, files(id, name)",
        pageToken: nextPageToken,
      })) as { data: drive_v3.Schema$FileList };

      nextPageToken = response.data.nextPageToken;
      const files = response.data.files;
      if (files) {
        count += files.length;
      }
    } catch (error) {
      nextPageToken = undefined;
    }
  } while (nextPageToken);

  return count;
}

export function getNewQuestions(formResponses?: FormResponse[]) {
  const newQuestions: Question[] = [];

  if (formResponses) {
    for (const response of formResponses) {
      for (const question of response.newQuestions) {
        newQuestions.push({
          author: response.author || "unknown",
          question,
          type: "short",
        });
      }
    }
  }

  if (newQuestions.length === 0) {
    newQuestions.push(PLACEHOLDER_QUESTION);
  }

  return [NAME_QUESTION, ...newQuestions, ...DEFAULT_QUESTIONS];
}

export async function getFormattedResponses({
  auth,
  form,
}: {
  auth: Auth.GoogleAuth;
  form: forms_v1.Schema$Form;
}) {
  const questionLookup = form.items!.reduce((lookup, item) => {
    lookup[item.questionItem?.question?.questionId ?? ""] = item.title!;
    return lookup;
  }, {} as Record<string, string>);

  const formResponse = await _getRawFormResponse({
    auth,
    formId: form.formId!,
  });

  return formResponse.responses?.map((response): FormResponse => {
    const newQuestions: string[] = [];
    let author = undefined;
    const answers = Object.values(response.answers || {}).map((answer) => {
      const questionId = answer.questionId!;
      const question = questionLookup[questionId];
      const value = answer?.textAnswers?.answers?.[0]?.value ?? "";
      if (question === NAME_QUESTION.question) {
        author = value;
        return undefined;
      }
      if (question === NEW_QUESTION.question) {
        newQuestions.push(...value.split(";").map((q) => q.trim()));
        return undefined;
      }
      return { questionId, question, answer: value };
    });

    return {
      author,
      newQuestions,
      responseId: response.responseId!,
      createTime: response.createTime || "",
      lastSubmittedTime: response.lastSubmittedTime || "",
      answers: answers.filter(
        (a) => a !== undefined
      ) as FormResponse["answers"],
    };
  });
}

/**
 * Retrieves the nth form from the shared folder, or the most recent if n is undefined.
 *
 * @param auth The Google authentication object.
 * @param folderId The ID of the folder.
 * @param n The index of the form to retrieve, or undefined.
 * @returns A promise that resolves to the nth form.
 */
export async function getNthForm({
  auth,
  folderId = SHARED_FOLDER_ID,
  n,
}: {
  auth: Auth.GoogleAuth;
  folderId?: string;
  n?: number;
}): Promise<forms_v1.Schema$Form | null> {
  const drive = google.drive({ version: "v3", auth });
  const forms = google.forms({ version: "v1", auth });
  const filesResponse = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.form' and trashed=false`,
    fields: "files(id, name, createdTime)",
    orderBy: "createdTime desc",
    pageSize: n ? undefined : 1, // no pagesize if n is defined since we don't know the total number of forms
  });

  if (
    filesResponse.data.files?.length &&
    filesResponse.data.files?.length > 0
  ) {
    const totalForms = filesResponse.data.files.length;
    if (n !== undefined && n > totalForms) {
      console.error(`Only ${totalForms} forms found`);
      return null;
    }
    const form = filesResponse.data.files[n ? totalForms - n : 0];
    console.log(
      `Google Form ${n ? `#${n}` : "most recent"}: ${form.name} (ID: ${
        form.id
      })`
    );
    if (form.id) {
      const formResponse = await forms.forms.get({ formId: form.id });
      return formResponse.data;
    }
  }
  return null;
}

export async function getForm({
  auth,
  formId,
}: {
  auth: Auth.GoogleAuth;
  formId: string;
}): Promise<forms_v1.Schema$Form> {
  const forms = google.forms({ version: "v1", auth });
  const formResponse = await forms.forms.get({ formId });
  return formResponse.data;
}

/**
 * Moves a Google Form to a specified folder.
 *
 * @param auth The Google authentication object.
 * @param fileId The ID of the file to move.
 * @param folderId The ID of the folder to move the file to.
 * @param fileName The new name of the file.
 * @returns The updated file data.
 */
export async function moveFormToFolder({
  auth,
  fileId,
  folderId,
  fileName,
}: {
  auth: Auth.GoogleAuth;
  fileId: string;
  folderId: string;
  fileName: string;
}) {
  const drive = google.drive({ version: "v3", auth });
  // Move the file to the new folder
  const files = await drive.files.update({
    fileId: fileId,
    addParents: folderId,
    removeParents: "root",
    fields: "id, parents",
    requestBody: {
      name: fileName,
    },
  });
  return files.data;
}

/**
 * Converts an array of questions to an array of form requests.
 * The google api doesn't allow you to create a form in one go,
 * so you have to create an empty one and then populate it with questions (._.)
 *
 * @param questions The array of questions to convert.
 * @returns An array of form requests.
 */
export function questionsToRequests(
  question: Question[]
): forms_v1.Schema$Request[] {
  return question.map((q, index): forms_v1.Schema$Request => {
    let questionData: forms_v1.Schema$Question | undefined = undefined;

    if (q.type === "image") {
      questionData = {
        fileUploadQuestion: {
          folderId: IMAGE_FOLDER_ID,
          types: ["IMAGE", "VIDEO"],
          maxFiles: 1,
        },
      };
      // note(ethan): the google forms api currently doesn't support file upload questions :)
      throw new Error("Image questions are not supported");
    } else if (q.type === "short" || q.type === "paragraph") {
      questionData = {
        textQuestion: {
          paragraph: q.type === "paragraph",
        },
      };
    }

    return {
      createItem: {
        item: {
          title: q.question,
          description: q.description,
          questionItem: { question: { ...questionData, required: q.required } },
        },
        location: { index },
      },
    };
  });
}

/**
 * Updates a Google Form with new questions and description.
 *
 * @param auth The Google authentication object.
 * @param formId The ID of the form to update.
 * @param questions The array of questions to add to the form.
 * @param description The description of the form (optional).
 * @returns The updated form data.
 */
export async function updateForm({
  auth,
  formId,
  questions,
  description,
}: {
  auth: Auth.GoogleAuth;
  formId: string;
  questions: Question[];
  description?: string;
}) {
  const forms = google.forms({
    version: "v1",
    auth,
  });

  const extraUpdates: forms_v1.Schema$Request[] = [];
  if (description !== undefined) {
    extraUpdates.push({
      updateFormInfo: { info: { description }, updateMask: "description" },
    });
  }

  const res = await forms.forms.batchUpdate({
    formId,
    requestBody: {
      includeFormInResponse: true,
      requests: [...extraUpdates, ...questionsToRequests(questions)],
    },
  });
  return res.data;
}
/**
 * Get current cadence
 *
 *@param auth The Google authentication object.
 */
// TO-DO expand this to handle multiple guild+channel cadence
export async function getCadence({
  auth,
}: {
  auth: Auth.GoogleAuth;
}): Promise<number> {
  const sheetService = google.sheets({ version: "v4", auth });
  const drive = google.drive({ version: "v3", auth });
  const response = await drive.files.list({
    q: `name='${SPREAD_SHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet'`,
    fields: "files(id, name)",
  });

  const files = response.data.files;
  if (files && files.length > 0) {
    const sheetID = files[0].id!;
    const response = await sheetService.spreadsheets.values.get({
      spreadsheetId: sheetID,
      range: `${CADENCE_SHEET_NAME}!C1`,
    });
    return parseInt(response.data.values?.[0]?.[0]); // response.data.values in the form of [[ cadence ]]
  } else {
    return 0;
  }
}

/**
 * Update the current cadence
 *
 * @param auth The Google authentication object.
 * @param guildID The ID of the guild
 * @param channelID The ID of the channel
 * @param newCadence Days between issues
 */
// TO-DO expand this to handle multiple guild+channel cadence
export async function updateCadence({
  auth,
  newCadence,
  guildID,
  channelID,
}: {
  auth: Auth.GoogleAuth;
  newCadence: number;
  guildID: string;
  channelID: string;
}) {
  const sheetService = google.sheets({ version: "v4", auth });
  const drive = google.drive({ version: "v3", auth });
  const response = await drive.files.list({
    q: `name='${SPREAD_SHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet'`,
    fields: "files(id, name)",
  });

  const files = response.data.files;
  if (files && files.length > 0) {
    const sheetID = files[0].id!;
    const updateData = {
      values: [[guildID, channelID, newCadence]],
    };
    await sheetService.spreadsheets.values.update({
      spreadsheetId: sheetID,
      range: `${CADENCE_SHEET_NAME}!A1:C1`,
      valueInputOption: "RAW",
      requestBody: updateData,
    });
  } else {
    //create new sheet file with newCadence
    console.log("Creating new sheet...");
    await createCadence({ auth });
    await updateCadence({ auth, guildID, channelID, newCadence });
  }
}

/**
 * Create new cadence sheet
 *
 *@param auth The Google authentication object.
 */
// TO-DO expand this to handle multiple guild+channel cadence
export async function createCadence({
  auth,
}: {
  auth: Auth.GoogleAuth;
}): Promise<string> {
  const sheetService = google.sheets({ version: "v4", auth });
  try {
    const spreadsheet = await sheetService.spreadsheets.create({
      requestBody: {
        properties: {
          title: SPREAD_SHEET_NAME,
        },
        sheets: [
          {
            properties: {
              title: CADENCE_SHEET_NAME, // Specify the title of the sheet
            },
            data: [
              {
                startRow: 0,
                startColumn: 0,
                rowData: [
                  {
                    values: [
                      { userEnteredValue: { stringValue: "guildID" } }, // Column A Row 1, should store guildID
                      { userEnteredValue: { stringValue: "channelID" } }, // Column B Row 1, should store channelID
                      { userEnteredValue: { numberValue: 0 } }, // Column C Row 1, should store cadence for newsletter
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      fields: "spreadsheetId",
    });

    await moveFormToFolder({
      auth,
      fileId: spreadsheet.data.spreadsheetId!,
      folderId: SHARED_FOLDER_ID,
      fileName: SPREAD_SHEET_NAME,
    });
    return spreadsheet.data.spreadsheetId!;
  } catch (err) {
    throw Error("Problem creating Spreadsheet");
  }
}

/**
 * Creates a new Google Form with the specified title, questions, and description.
 * First has to create an empty form, then moves it into the shared folder,
 * and finally updates it with the description and questions.
 *
 * @param auth The Google authentication object.
 * @param title The title of the form.
 * @param fileName The name of the file.
 * @param questions The array of questions to add to the form.
 * @param description The description of the form (optional).
 * @returns The created form data.
 */
export async function createForm({
  auth,
  title,
  fileName,
  questions,
  description,
}: {
  auth: Auth.GoogleAuth;
  title: string;
  fileName: string;
  questions: Question[];
  description?: string;
}) {
  const forms = google.forms({
    version: "v1",
    auth,
  });

  const res = await forms.forms.create({
    requestBody: { info: { title } } as forms_v1.Schema$Form,
  });

  const formId = res.data.formId;

  if (!formId) {
    throw new Error("No form ID was returned from the API");
  }

  await moveFormToFolder({
    auth,
    fileId: formId,
    folderId: SHARED_FOLDER_ID,
    fileName,
  });

  const form = await updateForm({
    auth,
    formId,
    questions,
    description,
  });

  return form;
}

if (module === require.main) {
  const auth = getAuth();
  // createForm({
  //   auth,
  //   title: "api test form",
  //   fileName: "test_form",
  //   questions: getNewQuestions(),
  //   description: "bruh bruh bruh",
  // })
  //   .then(console.log)
  //   .catch(console.error);

  // getMostRecentForm({ auth, folderId: SHARED_FOLDER_ID })
  //   .then((form) => {
  //     getFormattedResponses({ auth, form: form! })
  //       .then((output) => {
  //         console.log(JSON.stringify(output, null, 2));
  //       })
  //       .catch(console.error);
  //   })
  //   .catch(console.error);

  //updateCadence({auth, guildID: "guildID", channelID: "channelID", newCadence: 14})
  // getCadence({auth});
  getNthForm({ auth, n: 1 })
    .then((form) => {
      getFormattedResponses({ auth, form: form! })
        .then((output) => {
          console.log(JSON.stringify(output, null, 2));
        })
        .catch(console.error);
    })
    .catch(console.error);
}
