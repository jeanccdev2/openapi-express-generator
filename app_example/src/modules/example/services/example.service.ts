import { ExampleEntity } from "../entities/example.entity.js";

async function getExample(id: number) {
  return await ExampleEntity.findOne({ where: { id } });
}
async function postExample(name: string) {
  const example = ExampleEntity.create({ name });
  return await example.save();
}

export default {
  getExample,
  postExample,
};
