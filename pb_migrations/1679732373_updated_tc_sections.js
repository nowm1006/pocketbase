migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r0k26oh8gruibbi")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "lpqpk83h",
    "name": "name",
    "type": "select",
    "required": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "U"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r0k26oh8gruibbi")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "lpqpk83h",
    "name": "name",
    "type": "select",
    "required": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
