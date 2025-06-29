export type SignUpForm = {
  type:                 'enlisted' | 'nco';
  sn:                   string;
  name:                 string;
  unit:                 'headquarters' | 'supply' | 'medical' | 'transport' | 'unclassified';
  password:             string;
  passwordConfirmation: string;
};
