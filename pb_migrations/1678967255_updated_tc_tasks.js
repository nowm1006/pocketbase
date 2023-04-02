migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l1e4nmuo66f2p0n")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "68sx7ej7",
    "name": "project",
    "type": "relation",
    "required": true,
    "unique": false,
    "options": {
      "collectionId": "raxn67vwig094aa",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": [
        "name"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l1e4nmuo66f2p0n")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "68sx7ej7",
    "name": "project",
    "type": "relation",
    "required": false,
    "unique": false,
    "options": {
      "collectionId": "raxn67vwig094aa",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": [
        "name"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
