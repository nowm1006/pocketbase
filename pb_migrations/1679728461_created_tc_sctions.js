migrate((db) => {
  const collection = new Collection({
    "id": "r0k26oh8gruibbi",
    "created": "2023-03-25 07:14:21.740Z",
    "updated": "2023-03-25 07:14:21.740Z",
    "name": "tc_sctions",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "lpqpk83h",
        "name": "label",
        "type": "select",
        "required": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F"
          ]
        }
      },
      {
        "system": false,
        "id": "7lktbpbs",
        "name": "start",
        "type": "date",
        "required": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
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
  const collection = dao.findCollectionByNameOrId("r0k26oh8gruibbi");

  return dao.deleteCollection(collection);
})
