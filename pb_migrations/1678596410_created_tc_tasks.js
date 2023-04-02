migrate((db) => {
  const collection = new Collection({
    "id": "l1e4nmuo66f2p0n",
    "created": "2023-03-12 04:46:50.061Z",
    "updated": "2023-03-12 04:46:50.061Z",
    "name": "tc_tasks",
    "type": "base",
    "system": false,
    "schema": [
      {
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
      },
      {
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
          "displayFields": []
        }
      },
      {
        "system": false,
        "id": "nf75bnmz",
        "name": "estimate",
        "type": "number",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null
        }
      },
      {
        "system": false,
        "id": "ydl6mh5t",
        "name": "actual",
        "type": "number",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null
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
  const collection = dao.findCollectionByNameOrId("l1e4nmuo66f2p0n");

  return dao.deleteCollection(collection);
})
