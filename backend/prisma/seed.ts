import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Verificar se usuário master já existe
  const masterUserEmail = 'djcristiano.sgp@hotmail.com';
  const existingUser = await prisma.user.findUnique({
    where: { email: masterUserEmail },
  });

  if (existingUser) {
    console.log(`✅ Usuário master já existe: ${masterUserEmail}`);
    return;
  }

  // Gerar senha forte: A1b2C3d4E5f6G7h8!
  const masterPassword = 'MasterPass@2026!Secure';
  const hashedPassword = await bcrypt.hash(masterPassword, 10);

  // Criar usuário master
  const masterUser = await prisma.user.create({
    data: {
      email: masterUserEmail,
      password: hashedPassword,
      name: 'Master Admin',
    },
  });

  console.log(`✅ Usuário master criado com sucesso!`);
  console.log(`📧 Email: ${masterUserEmail}`);
  console.log(`🔐 Senha: ${masterPassword}`);
  console.log(`⚠️  Guarde essa senha em um local seguro!`);
  console.log(`\n👤 User ID: ${masterUser.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
