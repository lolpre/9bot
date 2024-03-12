/** A bunch of helper functions for interacting with google drive and forms */
import path from "path";
import { google, Auth, forms_v1 } from "googleapis";
import { DEFAULT_QUESTIONS, Question } from "./types";

const SHARED_FOLDER_ID = "1YNN4309aT7pAtursd7G8OIrF-iQbC7_d";
const IMAGE_FOLDER_ID = "1L9xOZlo986jHJOMZTjd4fj29-rXuD0xx";

/**
 * Lists files and folders in Google Drive.
 *
 * @param auth The Google authentication object.
 */
export async function listFiles(auth: Auth.GoogleAuth) {
  const drive = google.drive({ version: "v3", auth });
  try {
    // List the first 10 files and folders (you can adjust the pageSize)
    const response = await drive.files.list({
      pageSize: 10,
      fields: "nextPageToken, files(id, name, mimeType, parents)",
    });

    if (!response.data.files) {
      console.log("No files found.");
      return;
    }

    console.log("Files:");
    response.data.files.forEach((file: any) => {
      console.log(
        `Name: ${file.name}, ID: ${file.id}, Parent(s): ${file.parents}`,
      );
    });
  } catch (err) {
    console.error("The API returned an error: " + err);
  }
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
  question: Question[],
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

  try {
    const res = await forms.forms.batchUpdate({
      formId,
      requestBody: {
        includeFormInResponse: true,
        requests: [...extraUpdates, ...questionsToRequests(questions)],
      },
    });
    return res.data;
  } catch (err) {
    console.error("Error updating form:", err);
    throw err;
  }
}

/**
 * Creates a new Google Form with the specified title, questions, and description.
 *
 * @param title The title of the form.
 * @param fileName The name of the file.
 * @param questions The array of questions to add to the form.
 * @param description The description of the form (optional).
 * @returns The created form data.
 */
export async function createForm({
  title,
  fileName,
  questions,
  description,
}: {
  title: string;
  fileName: string;
  questions: Question[];
  description?: string;
}) {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, "../../credentials.json"),
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  const forms = google.forms({
    version: "v1",
    auth,
  });

  try {
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
  } catch (err) {
    console.error("An error occurred while creating the form: " + err);
    throw err; // Rethrow the error to handle it at a higher level
  }
}

if (module === require.main) {
  createForm({
    title: "api test form",
    fileName: "test_form",
    questions: DEFAULT_QUESTIONS,
    description: "bruh bruh bruh",
  })
    .then(console.log)
    .catch(console.error);
}
