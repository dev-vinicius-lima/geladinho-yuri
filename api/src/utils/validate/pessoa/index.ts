export const TransformName = (name: string) => {
  if (name == null) return null;

  const nameParts = name?.trim().split(' ');

  return nameParts
    .map((word: string) => {
      const capitalized = word[0]?.toLocaleUpperCase();
      return capitalized?.concat(word?.substring(1));
    })
    .join(' ');
};

export const ValidateCEP = (value: string) => {
  if (value == null) return true;
  const rg = value.replace(/\D/g, '');
  if (rg?.length !== 8) return false;

  return true;
};

export const ValidateRG = (value: string) => {
  if (value == null) return true;
  const rg = value.replace(/\D/g, '');
  if (rg?.length !== 9) return false;

  return true;
};

export const ValidateCNH = (value: string) => {
  if (value == null) return true;
  const cnh = value.replace(/\D/g, '');
  if (cnh?.length !== 11) return false;

  if (/^(\d)\1+$/.test(cnh)) return false;

  return true;
};

export const ValidatePIS = (value: string) => {
  if (value == null) return true;
  const pis = value.replace(/\D/g, ''); // Remove caracteres não numéricos
  if (pis?.length !== 11) return false;

  // Cálculo do dígito verificador do PIS
  const multiplicadores = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(pis.charAt(i)) * multiplicadores[i];
  }

  const resto = soma % 11;
  let primeiroDigito = 11 - resto;
  if (primeiroDigito === 10 || primeiroDigito === 11) {
    primeiroDigito = 0;
  }

  // Verifica o primeiro dígito verificador
  if (parseInt(pis.charAt(10)) !== primeiroDigito) return false;

  return true;
};

export const ValidateCPF = (value: string, notEmpty = false) => {
  if (!value) return !notEmpty;
  const cpf = value.replace(/\D/g, ''); // Remove caracteres não numéricos
  if (cpf?.length !== 11) return false;

  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1+$/.test(cpf)) return false;

  // Calcula o primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let primeiroDigito = 11 - (soma % 11);
  if (primeiroDigito > 9) primeiroDigito = 0;

  // Calcula o segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  let segundoDigito = 11 - (soma % 11);
  if (segundoDigito > 9) segundoDigito = 0;

  // Verifica se os dígitos verificadores são válidos
  if (
    primeiroDigito === parseInt(cpf.charAt(9)) &&
    segundoDigito === parseInt(cpf.charAt(10))
  ) {
    return true;
  }

  return false;
};

export const ValidateCNPJ = (cnpj: string, notEmpty = false) => {
  if (!cnpj) return !notEmpty;
  cnpj = cnpj.replace(/[^\d]+/g, '');

  if (cnpj == '') return false;

  if (cnpj.length != 14) return false;

  // Elimina CNPJs invalidos conhecidos
  if (
    cnpj == '00000000000000' ||
    cnpj == '11111111111111' ||
    cnpj == '22222222222222' ||
    cnpj == '33333333333333' ||
    cnpj == '44444444444444' ||
    cnpj == '55555555555555' ||
    cnpj == '66666666666666' ||
    cnpj == '77777777777777' ||
    cnpj == '88888888888888' ||
    cnpj == '99999999999999'
  )
    return false;

  // Valida DVs
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    const teste = numeros.charAt(tamanho - i);
    soma += Number(teste) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

  if (resultado != Number(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    const teste = numeros.charAt(tamanho - i);
    soma += Number(teste) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado != Number(digitos.charAt(1))) return false;

  return true;
};
