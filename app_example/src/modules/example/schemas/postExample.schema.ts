import z from "zod";

export const getExampleSchema = {
  schema: {
    params: z.object({
      id: z.string(),
    }),
  },
};
export type GetExampleSchema = {
  Params: z.infer<typeof getExampleSchema.schema.params>;
};

export const postExampleSchema = {
  schema: {
    body: z.object({
      name: z.string(),
    }),
  },
};
export type PostExampleSchema = {
  Body: z.infer<typeof postExampleSchema.schema.body>;
};

export const updateExampleSchema = {
  schema: {
    body: z.object({
      name: z.string(),
    }),
    params: z.object({
      id: z.string(),
    }),
  },
};
export type UpdateExampleSchema = {
  Body: z.infer<typeof updateExampleSchema.schema.body>;
  Params: z.infer<typeof updateExampleSchema.schema.params>;
};

export const deleteExampleSchema = {
  schema: {
    params: z.object({
      id: z.string(),
    }),
  },
};
export type DeleteExampleSchema = {
  Params: z.infer<typeof deleteExampleSchema.schema.params>;
};
