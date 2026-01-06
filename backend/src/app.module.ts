import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@modules/auth/auth.module';
import { ClientsModule } from '@modules/clients/clients.module';
import { ProductsModule } from '@modules/products/products.module';
import { ServicesModule } from '@modules/services/services.module';
import { InvoicesModule } from '@modules/invoices/invoices.module';
import { CouponsModule } from '@modules/coupons/coupons.module';
import { CategoriesModule } from '@modules/categories/categories.module';
import { BrandsModule } from '@modules/brands/brands.module';
import { GroupsModule } from '@modules/groups/groups.module';
import { CompaniesModule } from '@modules/companies/companies.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    ClientsModule,
    ProductsModule,
    ServicesModule,
    InvoicesModule,
    CouponsModule,
    CategoriesModule,
    BrandsModule,
    GroupsModule,
    CompaniesModule,
  ],
})
export class AppModule {}
