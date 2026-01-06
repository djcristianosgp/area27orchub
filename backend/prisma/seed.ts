import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  const masterUserEmail = 'djcristiano.sgp@hotmail.com';
  const companyCpfCnpj = '12.231.191/0001-73';
  const companyName = 'DJ Cristiano Produções LTDA';

  const [existingUser, existingCompany] = await Promise.all([
    prisma.user.findUnique({ where: { email: masterUserEmail } }),
    prisma.company.findUnique({ where: { cpfCnpj: companyCpfCnpj } }),
  ]);

  const masterPassword = 'MasterPass@2026!Secure';
  const hashedPassword = await bcrypt.hash(masterPassword, 10);

  const companyData = {
    name: companyName,
    nickname: 'DJ Cristiano',
    cpfCnpj: companyCpfCnpj,
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
  };

  let company = existingCompany;
  if (!company) {
    company = await prisma.company.create({ data: companyData });
    console.log(`✅ Empresa criada com sucesso!`);
    console.log(`🏢 Nome: ${company.name}`);
    console.log(`📍 Localização: ${company.city}, ${company.state}`);
    console.log(`🆔 Company ID: ${company.id}`);
  } else {
    console.log(`✅ Empresa já existe: ${companyName}`);
  }

  let masterUser = existingUser;
  if (!masterUser) {
    masterUser = await prisma.user.create({
      data: {
        email: masterUserEmail,
        password: hashedPassword,
        name: 'Master Admin',
        companyId: company.id,
      },
    });
    console.log(`✅ Usuário master criado com sucesso!`);
    console.log(`📧 Email: ${masterUserEmail}`);
    console.log(`🔐 Senha: ${masterPassword}`);
    console.log(`⚠️  Guarde essa senha em um local seguro!`);
  } else {
    console.log(`✅ Usuário master já existe: ${masterUserEmail}`);
    if (!masterUser.companyId || masterUser.companyId !== company.id) {
      masterUser = await prisma.user.update({
        where: { id: masterUser.id },
        data: { companyId: company.id },
      });
      console.log('🔗 Usuário master vinculado à empresa existente.');
    }
  }

  console.log(`\n👤 User ID: ${masterUser.id}`);
  console.log(`✅ Empresa vinculada ao usuário master!`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
