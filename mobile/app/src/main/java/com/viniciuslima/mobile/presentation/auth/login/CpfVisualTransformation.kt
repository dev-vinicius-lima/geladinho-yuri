package com.viniciuslima.mobile.presentation.auth.login

import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.input.OffsetMapping
import androidx.compose.ui.text.input.TransformedText
import androidx.compose.ui.text.input.VisualTransformation

// Transforma "12345678901" → "123.456.789-01" visualmente
// O valor armazenado continua sendo só os dígitos (sem máscara)
class CpfVisualTransformation : VisualTransformation {
    override fun filter(text: AnnotatedString): TransformedText {
        val digits = text.text
        val masked = buildString {
            digits.forEachIndexed { i, c ->
                if (i == 3 || i == 6) append('.')
                if (i == 9) append('-')
                append(c)
            }
        }

        val offsetMapping = object : OffsetMapping {
            override fun originalToTransformed(offset: Int): Int = when {
                offset <= 3 -> offset
                offset <= 6 -> offset + 1
                offset <= 9 -> offset + 2
                offset <= 11 -> offset + 3
                else -> masked.length
            }

            override fun transformedToOriginal(offset: Int): Int = when {
                offset <= 3 -> offset
                offset <= 7 -> offset - 1
                offset <= 11 -> offset - 2
                offset <= 14 -> offset - 3
                else -> digits.length
            }
        }

        return TransformedText(AnnotatedString(masked), offsetMapping)
    }
}
