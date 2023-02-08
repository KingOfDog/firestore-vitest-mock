import { beforeEach, describe, expect, vi, test } from "vitest";

import {
  FakeFirestore,
  mockCollection,
  mockDoc
} from "../mocks/firestore";

describe("Firestore options", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  const database = {
    characters: [
      {
        id: "homer",
        name: "Homer",
        occupation: "technician",
        address: { street: "742 Evergreen Terrace" }
      },
      { id: "krusty", name: "Krusty", occupation: "clown" },
      {
        id: "bob",
        name: "Bob",
        occupation: "insurance agent",
        _collections: {
          family: [
            { id: "violet", name: "Violet", relation: "daughter" },
            { id: "dash", name: "Dash", relation: "son" },
            { id: "jackjack", name: "Jackjack", relation: "son" },
            { id: "helen", name: "Helen", relation: "wife" }
          ]
        }
      }
    ]
  };

  const options = {
    includeIdsInData: true
  };

  const db = new FakeFirestore(database, options);

  describe("Single records versus queries", () => {
    test("it can fetch a single record", async () => {
      expect.assertions(7);
      const record = await db
        .collection("characters")
        .doc("krusty")
        .get();
      expect(mockCollection).toHaveBeenCalledWith("characters");
      expect(mockDoc).toHaveBeenCalledWith("krusty");
      expect(record.exists).toBe(true);
      expect(record.id).toBe("krusty");
      const data = record.data();
      expect(data).toHaveProperty("name", "Krusty");
      expect(data).toHaveProperty("occupation", "clown");
      expect(data).toHaveProperty("id", "krusty");
    });
  });
});
