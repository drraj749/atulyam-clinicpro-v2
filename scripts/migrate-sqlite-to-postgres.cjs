require("dotenv/config");

const path = require("path");
const Database = require("better-sqlite3");
const { Pool } = require("pg");

const sqlitePath = path.resolve(
  process.cwd(),
  "dev.db"
);

const sqlite = new Database(sqlitePath, {
  readonly: true,
  fileMustExist: true,
});

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
});

const tables = [
  "Patient",
  "Medicine",
  "DiseaseTemplate",
  "DiseaseTemplateMedicine",
  "LabTest",
  "HospitalSettings",
  "Staff",
  "OpdVisit",
  "Prescription",
  "PrescriptionItem",
  "LabOrder",
  "LabOrderItem",
  "Attendance",
  "StaffSession",
];

const booleanColumns = new Set([
  "isActive",
  "loginEnabled",
  "morning",
  "afternoon",
  "night",
  "beforeFood",
  "afterFood",
  "sos",
  "active",
]);

function quoteIdentifier(value) {
  return `"${value.replace(/"/g, '""')}"`;
}

function normalizeValue(column, value) {
  if (value === undefined || value === null) {
    return null;
  }

  if (booleanColumns.has(column)) {
    return Boolean(value);
  }

  return value;
}

async function tableExists(client, table) {
  const result = await client.query(
    `
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = $1
    ) AS exists
    `,
    [table]
  );

  return result.rows[0].exists;
}

async function getPostgresCount(client, table) {
  const result = await client.query(
    `SELECT COUNT(*)::int AS count FROM ${quoteIdentifier(table)}`
  );

  return result.rows[0].count;
}

/*
 * Get the PostgreSQL sequence for a quoted,
 * case-sensitive Prisma table.
 */
async function getIdSequence(client, table) {
  const quotedTable =
    `"public"."${table.replace(/"/g, '""')}"`;

  const result = await client.query(
    `
    SELECT pg_get_serial_sequence(
      $1,
      'id'
    ) AS sequence_name
    `,
    [quotedTable]
  );

  return result.rows[0]?.sequence_name || null;
}

async function main() {
  let client = null;

  try {
    console.log("");
    console.log("==========================================");
    console.log(" Atulyam ClinicPro");
    console.log(" SQLite → Supabase PostgreSQL Migration");
    console.log("==========================================");
    console.log("");

    console.log("SQLite source:");
    console.log(sqlitePath);
    console.log("");

    /*
     * ---------------------------------------
     * 1. CHECK SQLITE
     * ---------------------------------------
     */

    console.log("Checking SQLite database...");

    const sqliteTables = sqlite
      .prepare(
        `
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
          AND name NOT LIKE 'sqlite_%'
        ORDER BY name
        `
      )
      .all();

    const availableTables = new Set(
      sqliteTables.map((row) => row.name)
    );

    console.log(
      `Found ${availableTables.size} SQLite table(s).`
    );

    console.log("");

    /*
     * ---------------------------------------
     * 2. READ SOURCE COUNTS
     * ---------------------------------------
     */

    console.log("SQLite source record counts:");
    console.log("");

    const sourceCounts = {};

    for (const table of tables) {
      if (!availableTables.has(table)) {
        sourceCounts[table] = 0;

        console.log(
          `${table}: TABLE NOT FOUND`
        );

        continue;
      }

      const result = sqlite
        .prepare(
          `SELECT COUNT(*) AS count FROM ${quoteIdentifier(table)}`
        )
        .get();

      sourceCounts[table] = Number(result.count);

      console.log(
        `${table}: ${sourceCounts[table]}`
      );
    }

    console.log("");

    /*
     * ---------------------------------------
     * 3. CONNECT TO SUPABASE
     * ---------------------------------------
     */

    console.log("Connecting to Supabase...");

    client = await pool.connect();

    await client.query("SELECT 1");

    console.log(
      "Supabase connection: OK"
    );

    console.log("");

    /*
     * ---------------------------------------
     * 4. CHECK DESTINATION TABLES
     * ---------------------------------------
     */

    console.log(
      "Checking Supabase tables..."
    );

    for (const table of tables) {
      const exists = await tableExists(
        client,
        table
      );

      if (!exists) {
        throw new Error(
          `Supabase table "${table}" does not exist.`
        );
      }

      console.log(`  ✓ ${table}`);
    }

    console.log("");

    /*
     * ---------------------------------------
     * 5. CHECK DESTINATION IS EMPTY
     * ---------------------------------------
     */

    console.log(
      "Checking that Supabase tables are empty..."
    );

    for (const table of tables) {
      const count =
        await getPostgresCount(
          client,
          table
        );

      if (count > 0) {
        throw new Error(
          `STOP: Supabase table "${table}" already contains ${count} record(s). Migration cancelled to prevent duplicate data.`
        );
      }
    }

    console.log(
      "All Supabase tables are empty."
    );

    console.log("");

    /*
     * ---------------------------------------
     * 6. START TRANSACTION
     * ---------------------------------------
     */

    console.log(
      "Starting migration..."
    );

    console.log("");

    await client.query("BEGIN");

    /*
     * ---------------------------------------
     * 7. MIGRATE DATA
     * ---------------------------------------
     */

    for (const table of tables) {
      if (!availableTables.has(table)) {
        continue;
      }

      const rows = sqlite
        .prepare(
          `SELECT * FROM ${quoteIdentifier(table)}`
        )
        .all();

      if (rows.length === 0) {
        console.log(
          `${table}: 0 records`
        );

        continue;
      }

      console.log(
        `Migrating ${table}: ${rows.length} record(s)...`
      );

      const columns = Object.keys(rows[0]);

      const columnSql = columns
        .map(quoteIdentifier)
        .join(", ");

      for (const row of rows) {
        const values = columns.map(
          (column) =>
            normalizeValue(
              column,
              row[column]
            )
        );

        const placeholders = values
          .map(
            (_, index) =>
              `$${index + 1}`
          )
          .join(", ");

        const sql = `
          INSERT INTO ${quoteIdentifier(table)}
          (${columnSql})
          VALUES (${placeholders})
        `;

        await client.query(
          sql,
          values
        );
      }

      console.log(
        `  ✓ ${table} migrated`
      );

      console.log("");
    }

    /*
     * ---------------------------------------
     * 8. RESET ID SEQUENCES
     * ---------------------------------------
     *
     * Important:
     * Prisma uses quoted, case-sensitive
     * table names such as "Patient".
     */

    console.log(
      "Updating PostgreSQL ID sequences..."
    );

    for (const table of tables) {
      const sequenceName =
        await getIdSequence(
          client,
          table
        );

      if (!sequenceName) {
        continue;
      }

      const maxResult =
        await client.query(
          `
          SELECT MAX(id) AS max_id
          FROM ${quoteIdentifier(table)}
          `
        );

      const maxId =
        maxResult.rows[0]?.max_id;

      if (maxId === null || maxId === undefined) {
        continue;
      }

      await client.query(
        `
        SELECT setval(
          $1::regclass,
          $2,
          true
        )
        `,
        [
          sequenceName,
          Number(maxId),
        ]
      );

      console.log(
        `  ✓ ${table} sequence updated`
      );
    }

    console.log("");

    /*
     * ---------------------------------------
     * 9. COMMIT
     * ---------------------------------------
     */

    await client.query("COMMIT");

    console.log(
      "PostgreSQL transaction committed."
    );

    console.log("");

    console.log(
      "=========================================="
    );

    console.log(
      " MIGRATION COMPLETED SUCCESSFULLY"
    );

    console.log(
      "=========================================="
    );

    console.log("");

    /*
     * ---------------------------------------
     * 10. VERIFY COUNTS
     * ---------------------------------------
     */

    console.log(
      "Verifying migrated record counts..."
    );

    console.log("");

    let verificationFailed = false;

    for (const table of tables) {
      const sourceCount =
        sourceCounts[table] || 0;

      const destinationCount =
        await getPostgresCount(
          client,
          table
        );

      const match =
        sourceCount ===
        destinationCount;

      console.log(
        `${table}: SQLite=${sourceCount} | Supabase=${destinationCount} | ${
          match
            ? "OK"
            : "MISMATCH"
        }`
      );

      if (!match) {
        verificationFailed = true;
      }
    }

    console.log("");

    if (verificationFailed) {
      console.log(
        "WARNING: One or more counts do not match."
      );
    } else {
      console.log(
        "ALL RECORD COUNTS MATCH."
      );
    }

    console.log("");

    console.log(
      "Your original dev.db was opened READ-ONLY."
    );

    console.log(
      "Your SQLite database was NOT modified."
    );

    console.log("");
  } catch (error) {
    console.error("");

    console.error(
      "=========================================="
    );

    console.error(
      " MIGRATION FAILED"
    );

    console.error(
      "=========================================="
    );

    console.error("");

    console.error(
      error.message || error
    );

    console.error("");

    if (client) {
      try {
        await client.query(
          "ROLLBACK"
        );

        console.error(
          "PostgreSQL transaction rolled back."
        );
      } catch (rollbackError) {
        console.error(
          "Rollback error:",
          rollbackError.message
        );
      }
    }

    console.error("");

    process.exitCode = 1;
  } finally {
    if (client) {
      client.release();
    }

    sqlite.close();

    await pool.end();
  }
}

main();