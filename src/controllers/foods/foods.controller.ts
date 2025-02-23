import { FOOD_TOPIC } from "@/constants/topics";
import { createFood, listFood } from "@/services/foods.service";
import { catchAsync } from "@/utils/catchAsync";
import { FoodSchemaType } from "@/validator/food.validator";
import { broadcastToTopic } from "@/websocket";

export const getFoods = catchAsync(async (c) => {
  const result = await listFood();
  return c.json({ data: result });
});

export const postFood = catchAsync(async (c) => {

  const item = await c.req.parseBody() as unknown as FoodSchemaType;

  const result = await createFood(item);


  broadcastToTopic(FOOD_TOPIC, JSON.stringify({ type: "create", data: result }));

  return c.json({ data: result });
});

export const patchFood = catchAsync(async (c) => {

});

export const removeFood = catchAsync(async (c) => {

});