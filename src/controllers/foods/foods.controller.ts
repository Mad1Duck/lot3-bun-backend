import { ListFood } from "@/services/foods.service";
import { catchAsync } from "@/utils/catchAsync";

export const getFoods = catchAsync(async (c) => {
  const result = await ListFood();
  return c.json({ data: result });
});

export const postFood = catchAsync(async (c) => {

});

export const patchFood = catchAsync(async (c) => {

});

export const removeFood = catchAsync(async (c) => {

});