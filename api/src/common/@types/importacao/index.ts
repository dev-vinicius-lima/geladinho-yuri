export interface IFuncionarioPlanilhaFieldsT {
  cpf: IImportXLSX<string>;
  nome_funcionario: IImportXLSX<string>;
  matricula: IImportXLSX<string>;
  empresa: IImportXLSX<string>;
  cnpj: IImportXLSX<string>;
}

export type IImportXLSX<T> = {
  value: T;
  location: string;
  header: string;
};
