migrate((db) => {
  const collection = new Collection({
    "id": "kj8qwvzkxwmi5qg",
    "created": "2023-03-12 04:46:09.067Z",
    "updated": "2023-03-12 04:46:09.067Z",
    "name": "tc_modes",
    "type": "base",
    "system": false,
    "schema": [
      {
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
      },
      {
        "system": false,
        "id": "7d0omlgb",
        "name": "color",
        "type": "select",
        "required": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "red",
            "green",
            "blue"
          ]
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
  const collection = dao.findCollectionByNameOrId("kj8qwvzkxwmi5qg");

  return dao.deleteCollection(collection);
})
