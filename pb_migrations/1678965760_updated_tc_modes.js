migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("kj8qwvzkxwmi5qg")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "as06cgjo",
    "name": "name",
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
  const collection = dao.findCollectionByNameOrId("kj8qwvzkxwmi5qg")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "as06cgjo",
    "name": "mode",
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
})
