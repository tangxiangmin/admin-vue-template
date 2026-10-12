export interface IOperation {
  key: string;
  label: string;
  icon?: string;
  danger?: boolean;
  show?: boolean;
  disabled?: boolean;
  children?: IOperation[];
  run?: () => unknown;
}
