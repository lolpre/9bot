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
