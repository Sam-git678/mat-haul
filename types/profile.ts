export type UserProfile = {
  id?: string;
  firstname?: string;
  lastname?: string;
  name?: string;
  email?: string;
  phone?: string;
  companyname?: string;
  companyregistrationnumber?: string;
  companyaddress?: string;
  usertype?: string;
  status?: string;
  createdat?: string;
  updatedat?: string;
  phoneverifiedat?: string;
  emailverifiedat?: string;
  hasweighbridge?: boolean;
  profileimageurl?: string;
  has_transaction_pin?: boolean;
  [key: string]: unknown;
};

export type ProfileUpdateData = {
  profile: UserProfile | null;
};
