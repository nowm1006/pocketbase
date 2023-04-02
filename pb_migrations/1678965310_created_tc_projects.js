migrate((db) => {
  const collection = new Collection({
    "id": "raxn67vwig094aa",
    "created": "2023-03-16 11:15:10.598Z",
    "updated": "2023-03-16 11:15:10.598Z",
    "name": "tc_projects",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "1wcjqu4c",
        "name": "name",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("raxn67vwig094aa");

  return dao.deleteCollection(collection);
})
