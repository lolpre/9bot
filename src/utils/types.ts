type QuestionType = "short" | "paragraph" | "image";

export interface Question {
  author: string;
  question: string;
  description?: string;
  required?: boolean;
  type: QuestionType;
}

export const DEFAULT_QUESTIONS: Question[] = [
  {
    author: "default",
    question: "🥺️👉👈 name pls",
    type: "short",
    required: true,
  },
  {
    author: "default",
    question: "😈 What's the latest in your life?",
    type: "short",
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
    type: "short",
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
];
