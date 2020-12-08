import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from 'config';

export default class AuthService {
  public static async hashPassword(
    password: string,
    salt = 10
  ): Promise<string> {
    return await bcrypt.hash(password, salt);
  }

  public static async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  public static generateToken(payload: Record<string, unknown>): string {
    const key = config.get<string>('App.auth.key');
    const tokenExpiresIn = config.get<number>('App.auth.tokenExpiresIn');

    return jwt.sign(payload, key, {
      expiresIn: tokenExpiresIn,
    });
  }
}
