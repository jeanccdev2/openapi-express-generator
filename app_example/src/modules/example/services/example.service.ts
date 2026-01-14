import {
  ExampleEntity,
  type CreateExampleEntity,
  type UpdateExampleEntity,
} from "@example/entities/example.entity.js";

async function getExample(id: number) {
  return await ExampleEntity.findOne({ where: { id } });
}

async function postExample(body: CreateExampleEntity) {
  const example = ExampleEntity.create(body);
  return await example.save();
}

async function updateExample(id: number, body: UpdateExampleEntity) {
  return await ExampleEntity.update({ id }, body);
}

async function deleteExample(id: number) {
  return await ExampleEntity.delete({ id });
}

export default {
  getExample,
  postExample,
  updateExample,
  deleteExample,
};
