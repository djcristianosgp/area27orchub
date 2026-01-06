-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "groups_name_key" ON "groups"("name");

-- AlterTable: Add foreign keys to products
ALTER TABLE "products" 
ADD COLUMN "categoryId" TEXT NOT NULL DEFAULT 'default-category',
ADD COLUMN "brandId" TEXT NOT NULL DEFAULT 'default-brand',
ADD COLUMN "groupId" TEXT NOT NULL DEFAULT 'default-group';

-- Create default entries
INSERT INTO "categories" (id, name, description) VALUES 
('default-category', 'Sem Categoria', 'Categoria padrão para produtos sem categoria'),
('cat-electronics', 'Eletrônicos', 'Produtos eletrônicos em geral'),
('cat-books', 'Livros', 'Livros e publicações'),
('cat-fashion', 'Moda', 'Roupas e acessórios');

INSERT INTO "brands" (id, name, description) VALUES 
('default-brand', 'Sem Marca', 'Marca padrão para produtos sem marca'),
('brand-amazon', 'Amazon', 'Marca Amazon'),
('brand-samsung', 'Samsung', 'Marca Samsung'),
('brand-apple', 'Apple', 'Marca Apple');

INSERT INTO "groups" (id, name, description) VALUES 
('default-group', 'Sem Grupo', 'Grupo padrão para produtos sem grupo'),
('group-tech', 'Tecnologia', 'Produtos de tecnologia'),
('group-home', 'Casa e Decoração', 'Produtos para casa'),
('group-sports', 'Esportes', 'Artigos esportivos');

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
