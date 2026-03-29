package com.viniciuslima.mobile.data.remote.dto.venda

data class CreateItemVendaDto(
    val produto_id: String,
    val quantidade: Int,
    val preco_unitario: Double
)

data class CreateVendaDto(
    val itens: List<CreateItemVendaDto>,
    val forma_pagamento: String,
    val valor_recebido: Double? = null,
)
