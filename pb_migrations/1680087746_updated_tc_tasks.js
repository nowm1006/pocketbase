migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l1e4nmuo66f2p0n")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ib1a2uxn",
    "name": "done",
    "type": "bool",
    "required": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l1e4nmuo66f2p0n")

  // remove
  collection.schema.removeField("ib1a2uxn")

  return dao.saveCollection(collection)
})
