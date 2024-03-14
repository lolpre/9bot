type QuestionType = "short" | "paragraph" | "image";

export interface Question {
  author: string;
  question: string;
  description?: string;
  required?: boolean;
  type: QuestionType;
}

export interface FormResponse {
  author?: string;
  responseId: string;
  createTime: string;
  lastSubmittedTime: string;
  newQuestions: string[];
  answers: {
    questionId: string;
    question: string;
    answer: string;
  }[];
}

export const NAME_QUESTION: Question = {
  author: "default",
  question: "🥺️👉👈 name pls",
  type: "short",
  required: true,
};

export const NEW_QUESTION: Question = {
  author: "default",
  question: "❓ Questions for Next Issue?",
  description: "You can add multiple separated by ';' (semicolon).",
  type: "short",
};

export const PLACEHOLDER_QUESTION: Question = {
  author: "default",
  question: "😈 What's the latest in your life?",
  type: "paragraph",
};

export const DEFAULT_QUESTIONS: Question[] = [
  {
    author: "default",
    question: "⛅️ One Good Thing",
    type: "paragraph",
  },
  {
    author: "default",
    question: "📣 Shout-Outs",
    type: "paragraph",
  },
  {
    author: "default",
    question: "📧 @ someone",
    type: "paragraph",
  },
  {
    author: "default",
    question: "💭 On Your Mind",
    type: "paragraph",
  },
  {
    author: "default",
    question: "👀 Check it Out",
    type: "paragraph",
  },
  {
    author: "default",
    question: "📸 Photo Wall",
    description: "Enter the URL of an image to share.",
    type: "short", //"image", (image not supported by their api)
  },
  NEW_QUESTION,
];
