migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r0k26oh8gruibbi")

  // remove
  collection.schema.removeField("7lktbpbs")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r0k26oh8gruibbi")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "7lktbpbs",
    "name": "start",
    "type": "date",
    "required": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  return dao.saveCollection(collection)
})
