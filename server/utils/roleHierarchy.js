
export const roleHierarchy = {
  admin: 5,
  manager: 4,
  hr: 3,
  tl: 2,
  employee: 1,
};

export const canManageRole = (
  actorRole,
  targetRole
) => {
  const actorLevel =
    roleHierarchy[actorRole];

  const targetLevel =
    roleHierarchy[targetRole];

  if (
    actorLevel === undefined ||
    targetLevel === undefined
  ) {
    return false;
  }

  return actorLevel > targetLevel;
};



export const canAccessRole = (
  actorRole,
  targetRole
) => {
  const actorLevel =
    roleHierarchy[actorRole];

  const targetLevel =
    roleHierarchy[targetRole];

  if (
    actorLevel === undefined ||
    targetLevel === undefined
  ) {
    return false;
  }

  return actorLevel >= targetLevel;
};


export const isValidRole = (role) => {
  return (
    roleHierarchy[role] !== undefined
  );
};