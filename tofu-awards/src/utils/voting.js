const POINT_TABLE = {
  normal: {
    3: [5, 3, 0],
    4: [5, 3, 1, 0],
  },
  premium: {
    3: [8, 5, 0],
    4: [8, 5, 2, 0],
  },
};

const POSITION_ALIAS = {
  primero: "1",
  segundo: "2",
  tercero: "3",
  cuarto: "4",
};

const getNormalizedNomineeCount = (nomineeCount) => (nomineeCount >= 4 ? 4 : 3);

export const getRequiredPositions = (nomineeCount) => {
  const normalizedCount = getNormalizedNomineeCount(nomineeCount);

  return Array.from({ length: normalizedCount }, (_, index) => String(index + 1));
};

export const getPointsForPosition = (position, nomineeCount, isPremium = false) => {
  const normalizedCount = getNormalizedNomineeCount(nomineeCount);
  const table = isPremium ? POINT_TABLE.premium : POINT_TABLE.normal;
  const positionNumber = Number(POSITION_ALIAS[position] || position);

  if (!positionNumber || positionNumber > normalizedCount) {
    return 0;
  }

  return table[normalizedCount][positionNumber - 1] ?? 0;
};

export const getPointsBreakdown = (nomineeCount, isPremium = false) => {
  const requiredPositions = getRequiredPositions(nomineeCount);

  return requiredPositions.map((position) => ({
    position,
    points: getPointsForPosition(position, nomineeCount, isPremium),
  }));
};

export const validateRankingSelection = (selectedVotes, nomineeCount) => {
  const requiredPositions = getRequiredPositions(nomineeCount);
  const votes = Object.values(selectedVotes).filter(Boolean);

  if (votes.length !== requiredPositions.length) {
    return false;
  }

  const uniqueVotes = new Set(votes);

  return (
    uniqueVotes.size === requiredPositions.length &&
    requiredPositions.every((position) => uniqueVotes.has(position))
  );
};
