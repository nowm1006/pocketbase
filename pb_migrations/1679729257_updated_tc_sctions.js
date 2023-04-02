migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r0k26oh8gruibbi")

  collection.name = "tc_sections"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r0k26oh8gruibbi")

  collection.name = "tc_sctions"

  return dao.saveCollection(collection)
})
