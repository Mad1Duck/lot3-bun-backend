import { prisma } from "@/bin/database";
import { CategorySchemaType } from "@/validator/categories.validator";

export const createCategory = (item: CategorySchemaType) => {
  return prisma.category.create({
    data: {
      name: item.name,
    }
  });
};

export const updateCategory = ({ id, item }: { item: CategorySchemaType, id: string; }) => {
  return prisma.category.update({
    where: {
      id
    },
    data: {
      name: item.name,
    }
  });
};

export const deleteCategory = ({ id }: { id: string; }) => {
  return prisma.category.delete({
    where: {
      id
    },
  });
};


export const listCategory = () => {
  return prisma.category.findMany();
};