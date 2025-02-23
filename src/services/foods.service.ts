import { prisma } from "@/bin/database";
import { FoodSchemaType } from "@/validator/food.validator";

export const createFood = (item: FoodSchemaType) => {
  console.log(item);

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

export const listFood = () => {
  return prisma.foods.findMany();
};