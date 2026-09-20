import { useState } from 'react'
import { toast } from '../lib/shadcn/sonner'

const PAYLOAD_EXAMPLE = `{
  "transacao_id": "PUN-982314-2026",
  "colaborador": {
    "id": "EMP-01",
    "cpf_hash": "a2b9f018e..."
  },
  "registro": {
    "timestamp": "2026-08-13T08:00:12Z",
    "tipo_marcacao": "ENTRADA_1",
    "dispositivo": "BIO_RECEPT_01"
  },
  "status_validacao": "APROVADO"
}`

export default function Integration() {
  const [copied, setCopied] = useState(false)

  async function copyPayload() {
    try {
      await navigator.clipboard.writeText(PAYLOAD_EXAMPLE)
      setCopied(true)
      toast.success('Payload JSON copiado!')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Não foi possível copiar o payload')
    }
  }

  return (
    <section className="space-y-6">
      <div className="bg-card p-6 rounded-xl border border-border space-y-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-base font-bold text-foreground">Barramento de Integração REST & Relógio Bio</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Status em tempo real das conexões com dispositivos biométricos e exportações CNAB/ERP. Os dados de ponto e
            colaboradores deste painel são persistidos no banco de dados relacional da aplicação.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-background rounded-lg border border-border">
            <span className="text-xs text-muted-foreground font-mono">ENDPOINT DE REGISTRO</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">POST /api/v2/ponto</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                Ativo
              </span>
            </div>
          </div>

          <div className="p-4 bg-background rounded-lg border border-border">
            <span className="text-xs text-muted-foreground font-mono">BANCO DE DADOS</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-bold text-foreground font-mono">PostgreSQL (Retool DB)</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                Conectado
              </span>
            </div>
          </div>

          <div className="p-4 bg-background rounded-lg border border-border">
            <span className="text-xs text-muted-foreground font-mono">CNAB BANCÁRIO</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-bold text-foreground font-mono">Layout FEBRABAN 240</span>
              <span className="text-[10px] bg-muted text-muted-foreground border border-border px-1.5 py-0.5 rounded">
                Homologado
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-muted-foreground">EXEMPLO DE PAYLOAD JSON (Webhook de Batida)</label>
            <button onClick={copyPayload} className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline">
              {copied ? 'Copiado!' : 'Copiar JSON'}
            </button>
          </div>
          <pre className="bg-background text-emerald-700 dark:text-emerald-400 border border-border p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
            {PAYLOAD_EXAMPLE}
          </pre>
        </div>
      </div>
    </section>
  )
}
