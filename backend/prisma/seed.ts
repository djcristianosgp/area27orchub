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

  // Criar empresa fictícia para o usuário master
  const company = await prisma.company.create({
    data: {
      name: 'DJ Cristiano Produções LTDA',
      nickname: 'DJ Cristiano',
      cpfCnpj: '12.231.191/0001-73',
      street: 'Rua José Tiago dos Santos',
      number: '174',
      neighborhood: 'Santa Helena',
      city: 'São Gabriel da Palha',
      zipCode: '29780-000',
      state: 'ES',
      observations: 'Empresa fictícia para testes',
      emails: {
        create: [
          {
            email: 'contato@djcristiano.com',
            primary: true,
          },
          {
            email: 'djcristiano.sgp@hotmail.com',
            primary: false,
          },
        ],
      },
      phones: {
        create: [
          {
            phone: '(27) 99999-2823',
            hasWhatsapp: true,
            primary: true,
          },
        ],
      },
      socials: {
        create: [
          {
            platform: 'Instagram',
            url: 'https://instagram.com/djcristiano',
          },
          {
            platform: 'Facebook',
            url: 'https://facebook.com/djcristiano',
          },
        ],
      },
      pixKeys: {
        create: [
          {
            key: '27999992823',
            type: 'telefone',
          },
          {
            key: 'djcristiano@email.com',
            type: 'email',
          },
        ],
      },
    },
  });

  console.log(`\n✅ Empresa criada com sucesso!`);
  console.log(`🏢 Nome: ${company.name}`);
  console.log(`📍 Localização: ${company.city}, ${company.state}`);
  console.log(`🆔 Company ID: ${company.id}`);

  // Vincular empresa ao usuário master
  await prisma.user.update({
    where: { id: masterUser.id },
    data: { companyId: company.id },
  });

  console.log(`\n✅ Empresa vinculada ao usuário master!`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
