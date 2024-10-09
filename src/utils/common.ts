import * as bcrypt from 'bcrypt';

const roundSalt = 10;
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(roundSalt);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
