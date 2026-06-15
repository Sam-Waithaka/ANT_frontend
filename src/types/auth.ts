export type AuthTokens = {
  access: string;
  refresh: string;
};

export type AuthProfile = {
  bio: string;
  displayName: string;
  location: string;
  ministryOrDepartment: string;
  profilePhoto: string | null;
  relationshipToChurch: string;
};

export type AuthUser = {
  email: string;
  emailVerified: boolean;
  firstName: string;
  groups: string[];
  id: number | string;
  lastName: string;
  permissions: string[];
  phoneNumber: string;
  profile: AuthProfile | null;
  username: string;
};

export type AuthStatus = 'anonymous' | 'authenticated' | 'loading';

export type AuthSession = {
  tokens: AuthTokens;
  user: AuthUser;
};

export type AuthMeUpdate = {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
};

export type AuthProfileUpdate = {
  bio?: string;
  displayName?: string;
  location?: string;
  ministryOrDepartment?: string;
  relationshipToChurch?: string;
};
