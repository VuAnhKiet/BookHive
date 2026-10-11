import dataSource from '../config/data-source';
import { User } from '../entities/user.entity';
import { UserRole } from '../common/enum/user/user-role.enum';

async function bootstrapAdmin(email: string): Promise<void> {
  await dataSource.initialize();

  const users = dataSource.getRepository(User);
  const existingAdminCount = await users.count({
    where: { role: UserRole.ADMIN },
  });
  if (existingAdminCount > 0) {
    throw new Error(
      'An admin account already exists. Use the admin dashboard to manage roles.',
    );
  }

  const user = await users.findOneBy({ email });
  if (!user) {
    throw new Error(
      `No account found for ${email}. Register that account first, then retry.`,
    );
  }

  user.role = UserRole.ADMIN;
  await users.save(user);
  console.info(`Admin access enabled for ${email}. Sign in with its existing password.`);
}

async function main(): Promise<void> {
  const email = process.argv[2]?.trim();
  if (!email) {
    console.error('Usage: npm run admin:bootstrap -- <registered-email>');
    process.exitCode = 1;
    return;
  }

  try {
    await bootstrapAdmin(email);
  } catch (error: unknown) {
    console.error(
      error instanceof Error ? error.message : 'Could not bootstrap the admin account.',
    );
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

void main();
