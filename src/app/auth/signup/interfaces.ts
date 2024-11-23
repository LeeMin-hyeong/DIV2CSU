export type SignUpForm = {
  type:                 'enlisted' | 'nco';
  sn:                   string;
  name:                 string;
  unit:                 'headquarters' | 'supply' | 'medical' | 'transport' | null;
  password:             string;
  passwordConfirmation: string;
};
