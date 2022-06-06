import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("star_map").del();

    // Inserts seed entries
    await knex("star_map").insert([
        { count: 5, coordinates: "rowValue3" },
        { count: 10, coordinates: "rowValue3" },
        { count: 15, coordinates: "rowValue3" }

    ]);
};
