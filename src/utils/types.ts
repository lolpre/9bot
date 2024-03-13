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

export const DEFAULT_QUESTIONS: Question[] = [
  NAME_QUESTION,
  {
    author: "default",
    question: "😈 What's the latest in your life?",
    type: "paragraph",
  },
  {
    author: "default",
    question: "⛅️ One Good Thing",
    type: "short",
  },
  {
    author: "default",
    question: "📣 Shout-Outs",
    type: "short",
  },
  {
    author: "default",
    question: "📧 @ someone",
    type: "short",
  },
  {
    author: "default",
    question: "💭 On Your Mind",
    type: "paragraph",
  },
  {
    author: "default",
    question: "👀 Check it Out",
    type: "short",
  },
  {
    author: "default",
    question: "📸 Photo Wall",
    description: "Enter the URL of an image to share.",
    type: "short", //"image", (image not supported by their api)
  },
  {
    author: "default",
    question: "❓ Questions for Next Issue?",
    description: "You can add multiple separated by ';' (semicolon).",
    type: "short",
  },
];
