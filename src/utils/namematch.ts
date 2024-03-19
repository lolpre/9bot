import { NINE_DIC } from "@/defaults";

export function findClosestName(inputName: string, names: string[]): string {
  let closestName: string = "";
  let minDistance: number = Infinity;

  for (const name of names) {
    const distance: number = levenshteinDistance(inputName, name);
    if (distance < minDistance) {
      minDistance = distance;
      closestName = name;
    }
  }

  switch (closestName) {
    case "jp":
    case "joshy":
    case "korean":
      return "jp";
    case "kenen":
    case "chromebook":
      return "kenen";
    case "nathan":
    case "naykun":
      return "kun";
    case "boyu":
    case "alex":
      return "boyu";
    case "ethan":
    case "yeeb":
      return "ethan";
    case "julian":
    case "jthemage":
    case "j":
      return "julian";
    case "vincent":
    case "vin":
      return "vin";
    case "sri":
    case "harsha":
    case "tango":
      return "tango";
    case "sandwich":
    case "dean":
    case "white":
      return "dean";
    default:
      return "boyu";
  }
}

function levenshteinDistance(s1: string, s2: string): number {
  const len1: number = s1.length;
  const len2: number = s2.length;

  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(null));

  for (let i = 0; i <= len1; i++) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost: number = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}
