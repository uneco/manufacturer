/* eslint-disable */

export default {
  "$schema": "https://lkm62.csb.app/schema.json",
  "entities": {
    "products": {
      "collections": {},
      "properties": {
        "displayName": {
          "type": "string"
        }
      }
    },
    "users": {
      "collections": {
        "articles": {
          "properties": {
            "title": {
              "type": "string"
            },
            "body": {
              "type": "string"
            },
            "postedAt": {
              "type": "integer"
            }
          },
          "required": ["title", "postedAt"]
        }
      },
      "properties": {
        "email": {
          "type": "string",
          "format": "email"
        },
        "displayName": {
          "type": "string"
        },
        "groups": {
          "type": "array",
          "items": {
            "type": "string",
            "uniqueItems": true
          }
        },
        "address": {
          "type": "object",
          "properties": {
            "country": {
              "type": "string"
            },
            "state": {
              "type": "string"
            },
            "city": {
              "type": "string"
            }
          }
        },
        "registeredAt": {
          "type": "integer"
        }
      },
      "required": ["email", "registeredAt"]
    }
  }
} as const
