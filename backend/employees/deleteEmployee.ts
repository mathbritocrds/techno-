type Params = {
  id: number
}

export default async function deleteEmployee(req: { params: Params }) {
  const { id } = req.params
  if (!id) throw new Error('id é obrigatório')

  await retoolDb.query('DELETE FROM employees WHERE id = $1', [id])
  return { success: true }
}
