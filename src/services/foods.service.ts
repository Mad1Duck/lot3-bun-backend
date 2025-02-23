import { prisma } from "@/bin/database";
import { FoodSchemaType } from "@/validator/food.validator";

export const createFood = (item: FoodSchemaType) => {
  return prisma.foods.create({
    data: {
      name: item.name,
      categoryId: item.categoryId,
      imageURL: item.imageURL,
      price: item.price,
      description: item.description,
      isAvailable: item.isAvailable,
      timeToCook: item.timeToCook
    }
  });
};

export const ListFood = () => {
  return prisma.foods.findMany();
};