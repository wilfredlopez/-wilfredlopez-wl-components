export interface InputChangeEventDetail {
  value: string | undefined | null;
}
export interface StyleEventDetail {
  [styleName: string]: boolean;
}
export type TextFieldTypes =
  | "date"
  | "email"
  | "number"
  | "password"
  | "search"
  | "tel"
  | "text"
  | "url";
