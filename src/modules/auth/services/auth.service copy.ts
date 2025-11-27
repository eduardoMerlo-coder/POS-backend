/**
 import { prisma } from "@/data/postgres";
import { loginDTO } from "./auth.schema";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { randomUUID } from "node:crypto";

const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || "1d";
const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || "7d";
const secretKey = process.env.SECRET_KEY_JWT;
const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || "10");

interface RefreshTokenPayload extends JwtPayload {
  jti: string;
  sub: string;
}

export class AuthService {
  constructor() {}

  async login(data: loginDTO) {
    try {
      const { name, password } = data;
      if (!secretKey) {
        throw new Error("JWT_SECRET_KEY is required");
      }
      const user = await prisma.user.findFirst({
        where: {
          name,
        },
        include: {
          role: true,
        },
      });
      if (!user) throw new Error("Incorrect credentials!");
      const match = await bcrypt.compare(password, user.password);
      if (!match) throw new Error("Incorrect credentials!");

      const accessToken = jwt.sign({ sub: String(user.id) }, secretKey, {
        expiresIn: accessTokenExpiry,
      } as jwt.SignOptions);

      // FOR  REFRESH TOKEN
      const jti = randomUUID();
      const refreshToken = jwt.sign({ sub: String(user.id), jti }, secretKey, {
        expiresIn: refreshTokenExpiry,
      } as jwt.SignOptions);
      const refreshTokenHash = await bcrypt.hash(refreshToken, bcryptRounds);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

      await prisma.refreshToken.create({
        data: {
          jti,
          userId: user.id,
          tokenHash: refreshTokenHash,
          expiresAt,
        },
      });

      return {
        accessToken,
        jti,
        refreshToken: refreshToken,
        user: { id: user.id, name: user.name, role: user.role.type },
      };
    } catch (error) {
      throw error;
    }
  }

  async refresh({ refreshToken: refresh }: { refreshToken: string }) {
    try {
      if (!secretKey) throw new Error("missing SECRET_KEY_JWT on env file");
      const payload = jwt.verify(refresh, secretKey) as RefreshTokenPayload;

      const existToken = await prisma.refreshToken.findFirst({
        where: {
          jti: payload.jti,
        },
      });
      if (!existToken) throw new Error("invalid Token");
      const isSameToken = await bcrypt.compare(refresh, existToken.tokenHash);
      if (!isSameToken) throw new Error("invalid Token");
      if (existToken.revokedAt) throw new Error("Token revoked");
      console.log(existToken.expiresAt, new Date());
      if (existToken.expiresAt < new Date()) throw new Error("Token expired");

      const accessToken = jwt.sign({ sub: payload.sub }, secretKey, {
        expiresIn: accessTokenExpiry,
      } as jwt.SignOptions);

      // ROTATE REFRESH TOKEN IN TX
      const newJti = randomUUID();
      const newRefreshToken = jwt.sign(
        { sub: payload.sub, jti: newJti },
        secretKey,
        {
          expiresIn: refreshTokenExpiry,
        } as jwt.SignOptions
      );
      const newRefreshTokenHash = await bcrypt.hash(
        newRefreshToken,
        bcryptRounds
      );
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

      await prisma.$transaction([
        prisma.refreshToken.update({
          where: { id: existToken.id },
          data: { revokedAt: new Date() },
        }),
        prisma.refreshToken.create({
          data: {
            jti: newJti,
            userId: parseInt(payload.sub, 10),
            tokenHash: newRefreshTokenHash,
            expiresAt,
          },
        }),
      ]);

      const refreshedUser = await prisma.user.findUnique({
        where: { id: Number(payload.sub) },
        select: { id: true, name: true },
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: refreshedUser ?? { id: Number(payload.sub) },
      };
    } catch (error) {
      throw error;
    }
  }

  async logout({ refreshToken }: { refreshToken: string }) {
    try {
      const payload = jwt.verify(
        refreshToken,
        secretKey as jwt.Secret
      ) as jwt.JwtPayload;
      const userId = parseInt(payload.sub as string);

      console.time("db_delete");
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });
      console.timeEnd("db_delete");

      return { message: "logout successfully" };
    } catch (error) {
      throw error;
    }
  }
}

 */
