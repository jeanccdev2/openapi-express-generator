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
