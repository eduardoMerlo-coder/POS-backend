import { prisma } from "@/data/postgres";
import bcrypt from "bcryptjs";
import { CreateUserDto } from "./user.schema";

const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || "10");

export class UserService {
  async createUser(data: CreateUserDto) {
    const { name, password, rol } = data;
    try {
      let existingRole = await prisma.role.findUnique({
        where: { type: rol },
      });

      if (!existingRole) {
        existingRole = await prisma.role.create({
          data: {
            type: rol,
          },
        });
      }
      const salt = await bcrypt.genSalt(bcryptRounds);
      const hash = await bcrypt.hash(password, salt);

      return await prisma.user.create({
        data: {
          name,
          password: hash,
          roleId: existingRole.id,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getUsers() {
    try {
      return await prisma.user.findMany({ omit: { password: true } });
    } catch (error) {
      throw error;
    }
  }
}
