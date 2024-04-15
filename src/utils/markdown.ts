import { getAuth, getForm, getFormattedResponses, getNthForm } from "./forms";
import { FormResponse } from "./types";
import { DEFAULT_QUESTIONS, PHOTO_QUESTION } from "@/defaults";

const URL_REGEX = /https?:\/\/[^\s]+(\.[^\s]+)*/g;

// Function to generate markdown content from form responses
export function generateMarkdownFromResponses({
  responses,
  issueNumber,
  dateStr,
}: {
  responses: FormResponse[];
  issueNumber: number;
  dateStr: string;
}): string {
  // Object to hold questions and their corresponding answers
  const questionsMap: {
    [questionId: string]: {
      question: string;
      answers: { author?: string; answer: string }[];
    };
  } = {};

  // Populate the questionsMap with answers grouped by question
  responses.forEach((response) => {
    response.answers.forEach(({ questionId, question, answer }) => {
      if (!questionsMap[questionId]) {
        questionsMap[questionId] = { question, answers: [] };
      }
      questionsMap[questionId].answers.push({
        author: response.author,
        answer,
      });
    });
  });

  const defaultQuestions = DEFAULT_QUESTIONS.map((q) => q.question);
  const sortedQuestions = Object.values(questionsMap).sort((a, b) => {
    const indexA = defaultQuestions.indexOf(a.question);
    const indexB = defaultQuestions.indexOf(b.question);
    return (
      (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB)
    );
  });

  const description =
    `---\n` +
    `title: 9Loop Newsletter No.${issueNumber}\n` +
    `date: ${dateStr}\n` +
    `description: Issue No. ${issueNumber}\n` +
    `---\n\n`;

  // Generate markdown with two sections
  let questionsOfWeekContent = "## ***Questions of the Week***\n\n";
  let newsletterContent = "## ***Newsletter***\n\n";

  sortedQuestions.forEach(({ question, answers }) => {
    let questionContent = `### ${question}\n\n`;

    answers.forEach(({ author, answer }) => {
      const authorText = author ? `${author}` : "Anonymous";
      questionContent += `> **${authorText}**: ${answer}\n> \n`;
    });

    if (question === PHOTO_QUESTION.question) {
      questionContent = questionContent.replace(
        URL_REGEX,
        (url) => `![${url}](${url})`
      );
    }

    if (defaultQuestions.includes(question)) {
      newsletterContent += questionContent + "<br/>\n\n";
    } else {
      questionsOfWeekContent += questionContent + "<br/>\n\n";
    }
  });

  // Combine both sections into a single markdown content
  return `${description}${questionsOfWeekContent}${newsletterContent}`;
}

if (module === require.main) {
  const auth = getAuth();
  getForm({ auth, formId: "1YNRxlyDm5j3jjIBe9ZECZ2f3Btd9rXjAqWeC4ceRzis" })
    .then((form) => {
      getFormattedResponses({ auth, form: form! })
        .then((output) => {
          console.log(
            generateMarkdownFromResponses({
              responses: output!,
              issueNumber: 1,
              dateStr: "2024-03-17",
            })
          );
        })
        .catch(console.error);
    })
    .catch(console.error);
}
