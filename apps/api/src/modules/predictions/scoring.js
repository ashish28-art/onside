import { prisma } from "../../db/prisma.js";
import { footballProvider } from "../../integrations/football-provider/client.js";

function actualWinner(homeScore, awayScore) {
  if (homeScore > awayScore) return "HOME";
  if (awayScore > homeScore) return "AWAY";
  return "DRAW";
}

export async function evaluatePrediction(prediction) {
  if (prediction.evaluatedAt) {
    return prediction;
  }

  const match = await footballProvider.getMatch(prediction.matchId);
  if (match.status !== "FINISHED") {
    return prediction;
  }

  const homeScore = match.score.fullTime.home;
  const awayScore = match.score.fullTime.away;
  const winner = actualWinner(homeScore, awayScore);

  let points = 0;
  const exactScoreCorrect =
    prediction.predictedHomeScore === homeScore && prediction.predictedAwayScore === awayScore;
  const winnerCorrect = prediction.predictedWinner === winner;

  if (exactScoreCorrect) {
    points = 3;
  } else if (winnerCorrect) {
    points = 1;
  }

  return prisma.prediction.update({
    where: { id: prediction.id },
    data: { pointsAwarded: points, evaluatedAt: new Date() },
  });
}

export async function evaluateAll(predictions) {
  return Promise.all(predictions.map(evaluatePrediction));
}