import { prisma } from "@/bin/database";
import { FoodSchemaType } from "@/validator/food.validator";

export const createFood = (item: FoodSchemaType) => {
  return prisma.foods.create({
    data: {
      name: item.name,
      categoryId: item.categoryId || null,
      imageURL: item.imageURL,
      price: Number(item.price),
      description: item.description,
      isAvailable: Boolean(item.isAvailable),
      timeToCook: Number(item.timeToCook) || 0
    }
  });
};

export const updateFood = ({ id, item }: { item: FoodSchemaType, id: string; }) => {
  return prisma.foods.update({
    where: {
      id
    },
    data: {
      name: item.name,
      categoryId: item.categoryId || null,
      imageURL: item.imageURL,
      price: Number(item.price),
      description: item.description,
      isAvailable: Boolean(item.isAvailable),
      timeToCook: Number(item.timeToCook) || 0
    }
  });
};

export const deleteFood = ({ id }: { id: string; }) => {
  return prisma.foods.delete({
    where: {
      id
    },
  });
};


export const listFood = () => {
  return prisma.foods.findMany({
    include: {
      FoodCategory: true
    }
  });
};