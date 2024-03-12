import path from "path";
import { google, Auth } from "googleapis";

async function listFiles(auth: Auth.GoogleAuth) {
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

async function moveToFolder({
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
  console.log(files, files.status);
  return files.data;
}

async function createForm({
  title,
  fileName,
}: {
  title: string;
  fileName: string;
}) {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, "..", "credentials.json"),
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  const folderId = "1YNN4309aT7pAtursd7G8OIrF-iQbC7_d";

  const forms = google.forms({
    version: "v1",
    auth,
  });

  const newForm = { info: { title } };

  try {
    const res = await forms.forms.create({
      requestBody: newForm,
    });

    const fileId = res.data.formId;
    if (!fileId) {
      throw new Error("No form ID was returned from the API");
    }
    await moveToFolder({ auth, fileId, folderId, fileName });
    return res.data;
  } catch (err) {
    console.error("An error occurred while creating the form: " + err);
    throw err; // Rethrow the error to handle it at a higher level
  }
}

if (module === require.main) {
  createForm({ title: "test api", fileName: "test" }).catch(console.error);
}

export default createForm;
