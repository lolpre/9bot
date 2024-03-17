import { Question } from "./utils/types";

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

export const PHOTO_QUESTION: Question = {
  author: "default",
  question: "📸 Photo Wall",
  description: "Enter the URL of an image to share.",
  type: "short", //"image", (image not supported by their api)
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
  PHOTO_QUESTION,
  NEW_QUESTION,
];
