migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r0k26oh8gruibbi")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "vnlz11au",
    "name": "start",
    "type": "number",
    "required": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "q0flbox5",
    "name": "comment",
    "type": "text",
    "required": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r0k26oh8gruibbi")

  // remove
  collection.schema.removeField("vnlz11au")

  // remove
  collection.schema.removeField("q0flbox5")

  return dao.saveCollection(collection)
})
