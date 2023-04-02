migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l1e4nmuo66f2p0n")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "9g6p5vkn",
    "name": "mode",
    "type": "relation",
    "required": false,
    "unique": false,
    "options": {
      "collectionId": "kj8qwvzkxwmi5qg",
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
    "id": "9g6p5vkn",
    "name": "mode",
    "type": "relation",
    "required": true,
    "unique": false,
    "options": {
      "collectionId": "kj8qwvzkxwmi5qg",
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
