export const STATUS_VENDA = {
  CONCLUIDA: 'concluida',
  CANCELADA: 'cancelada',
} as const;

export const FORMA_PAGAMENTO = {
  DINHEIRO: 'dinheiro',
  PIX: 'pix',
  CARTAO_CREDITO: 'cartao_credito',
  CARTAO_DEBITO: 'cartao_debito',
  FIADO: 'fiado',
} as const;

export type FormaPagamentoType = (typeof FORMA_PAGAMENTO)[keyof typeof FORMA_PAGAMENTO];
