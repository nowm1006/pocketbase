migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l1e4nmuo66f2p0n")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "yimwba3s",
    "name": "section",
    "type": "relation",
    "required": false,
    "unique": false,
    "options": {
      "collectionId": "r0k26oh8gruibbi",
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
    "id": "yimwba3s",
    "name": "section",
    "type": "relation",
    "required": false,
    "unique": false,
    "options": {
      "collectionId": "r0k26oh8gruibbi",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": []
    }
  }))

  return dao.saveCollection(collection)
})
