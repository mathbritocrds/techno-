interface Params {
  limit?: number
}

export default async function (req: { params: Params }) {
  const limit = req.params.limit ?? 50
  const result = await retoolDb.query(
    `SELECT * FROM cost_analyses ORDER BY created_at DESC LIMIT $1`,
    [limit]
  )
  return result.data
}
