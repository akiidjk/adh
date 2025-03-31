"use server";

import { getClient } from '@/lib/redis';

export async function GET() {
  const client = await getClient();

  try {
    const keys = (await client.keys('*')).filter(key => key !== 'data_stream');

    if (keys.length === 0) {
      return jsonResponse(0, []);
    }

    const values = await client.json.mGet(keys, "$");
    if (!values) {
      return jsonResponse(0, []);
    }
    const safeValues = values.map(val => val ?? Object.create(null));
    const newValues = formatValues(keys, safeValues);
    return jsonResponse(values.length, newValues)
  } catch (error) {
    console.error("Redis error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function jsonResponse(count: number, data: object) {
  return new Response(
    JSON.stringify({ request_number: count, data }),
    { headers: { "Content-Type": "application/json" } }
  );
}

function formatValues(keys: string[], values: object[][]): { [x: string]: object }[] {
  const formattedValues = [];
  for (const [index, value] of values.entries()) {
    const formattedKey = keys[index];
    formattedValues.push({ [formattedKey]: value[0] });
  }
  return formattedValues;
}
