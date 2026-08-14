import qdrant from "./qdrant.js";

const COLLECTION_NAME = "pdf_documents";

export const createCollection = async () => {
  const collections = await qdrant.getCollections();

  const exists = collections.collections.some(
    (collection) => collection.name === COLLECTION_NAME
  );

  if (!exists) {
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 3072,
        distance: "Cosine",
      },
    });

    console.log("Qdrant collection created");
  }

  await qdrant.createPayloadIndex(COLLECTION_NAME, {
    field_name: "chatId",
    field_schema: "keyword",
  });

  console.log("chatId index created");
};