export interface Review {
  readonly id: string;
  readonly name: string;
  /** 1 to 5 */
  readonly stars: number;
  readonly text: string;
}
