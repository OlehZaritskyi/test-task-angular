export interface IFormsArray {
  birthDate: IBirthDate;
  country: string;
  name: string;
}

export interface IBirthDate {
  day: number;
  month: number;
  year: number;
}

export interface IResponse {
  result: string
}
