import { UserType } from './lobby';
import { calculateMatchScore } from './social-galaxy';

export function getNemesisAndBestie(currentUser: UserType, users: UserType[]): { nemesis: UserType | null, bestie: UserType | null } {
  let nemesis: UserType | null = null;
  let bestie: UserType | null = null;
  let minScore = Infinity;
  let maxScore = -Infinity;

  users.forEach(user => {
    if (user.id === currentUser.id) return;
    const score = calculateMatchScore(currentUser, user);
    if (score < minScore) {
      minScore = score;
      nemesis = user;
    }
    if (score > maxScore) {
      maxScore = score;
      bestie = user;
    }
  });

  return { nemesis, bestie };
}
