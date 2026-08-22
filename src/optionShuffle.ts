import type { Task, TaskOption } from './taskEngine';

export type ShuffledQuestion = {
  taskId: string;
  options: TaskOption[];
  correctPosition: number;
};

function fisherYates<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

export function shuffleQuestionOptions(task: Task, previousPositions: number[] = []): ShuffledQuestion {
  const options = fisherYates(task.options);
  const correctPosition = options.findIndex((option) => option.id === task.answerId);
  if (correctPosition < 0 || options.length < 2) return { taskId: task.id, options, correctPosition: Math.max(0, correctPosition) };

  const counts = options.map((_, position) => previousPositions.filter((value) => value === position).length);
  const minimum = Math.min(...counts);
  const balancedPositions = counts.map((count, position) => ({ count, position })).filter((item) => item.count === minimum).map((item) => item.position);
  const repeatedPosition = previousPositions.length >= 2 && previousPositions[previousPositions.length - 1] === previousPositions[previousPositions.length - 2] ? previousPositions[previousPositions.length - 1] : null;
  const allowedPositions = repeatedPosition === null ? balancedPositions : balancedPositions.filter((position) => position !== repeatedPosition);
  const targetPosition = (allowedPositions.length ? allowedPositions : balancedPositions)[Math.floor(Math.random() * (allowedPositions.length ? allowedPositions : balancedPositions).length)];
  if (targetPosition !== correctPosition) {
    [options[correctPosition], options[targetPosition]] = [options[targetPosition], options[correctPosition]];
  }
  return { taskId: task.id, options, correctPosition: targetPosition };
}

export function buildShuffledSession(tasks: Task[], startIndex = 0): Record<string, ShuffledQuestion> {
  const session: Record<string, ShuffledQuestion> = {};
  const positions: number[] = [];
  const ordered = [...tasks.slice(startIndex), ...tasks.slice(0, startIndex)];
  for (const task of ordered) {
    const question = shuffleQuestionOptions(task, positions);
    session[task.id] = question;
    positions.push(question.correctPosition);
  }
  return session;
}
