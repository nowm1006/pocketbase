migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l1e4nmuo66f2p0n")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wfzamp2e",
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
  const collection = dao.findCollectionByNameOrId("l1e4nmuo66f2p0n")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wfzamp2e",
    "name": "task",
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
