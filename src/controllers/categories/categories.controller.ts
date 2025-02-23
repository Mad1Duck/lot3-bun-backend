import { CATEGORY_TOPIC } from "@/constants/topics";
import { createCategory, deleteCategory, listCategory, updateCategory } from "@/services/categories.service";
import { catchAsync } from "@/utils/catchAsync";
import { CategorySchemaType } from "@/validator/categories.validator";
import { broadcastToTopic } from "@/websocket";

export const getCategories = catchAsync(async (c) => {
  const result = await listCategory();
  return c.json({ data: result });
});

export const postCategory = catchAsync(async (c) => {
  const item = await c.req.parseBody() as unknown as CategorySchemaType;

  const result = await createCategory(item);


  broadcastToTopic(CATEGORY_TOPIC, JSON.stringify({ type: "create", data: result }));

  return c.json({ data: result });
});

export const patchCategory = catchAsync(async (c) => {
  const item = await c.req.parseBody() as unknown as CategorySchemaType;
  const id = c.req.param('id');

  const result = await updateCategory({ item, id });


  broadcastToTopic(CATEGORY_TOPIC, JSON.stringify({ type: "update", data: result }));

  return c.json({ data: result });
});

export const removeCategory = catchAsync(async (c) => {
  const id = c.req.param('id');

  const result = await deleteCategory({ id });


  broadcastToTopic(CATEGORY_TOPIC, JSON.stringify({ type: "delete", data: result }));

  return c.json({ data: result });
});